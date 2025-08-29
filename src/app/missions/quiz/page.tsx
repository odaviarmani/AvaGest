
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Mission, priorities } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Check, X as IconX, BrainCircuit, Users, ShieldQuestion, Star, Shuffle, HelpCircle, FileText, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Helper to shuffle arrays
const shuffle = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    imageUrl: string | null;
    questionType: string;
}

const TOTAL_QUESTIONS = 50;
const MEMBERS = ["Davi", "Carol", "Lorenzo", "Thiago", "Miguel", "Italo"];


const questionTemplates = [
    { type: 'points', generator: (m: Mission) => ({
        question: `Qual é a pontuação da missão "${m.name}"?`,
        correctAnswer: m.points.toString(),
        questionType: 'points'
    })},
    { type: 'location', generator: (m: Mission) => ({
        question: `Onde a missão "${m.name}" está localizada?`,
        correctAnswer: m.location,
        questionType: 'location'
    })},
    { type: 'priority', generator: (m: Mission) => ({
        question: `Qual a prioridade da missão "${m.name}"?`,
        correctAnswer: m.priority,
        questionType: 'priority'
    })},
    { type: 'objective', generator: (m: Mission) => ({
        question: `Qual missão tem o objetivo: "${m.description.substring(0, 50)}..."?`,
        correctAnswer: m.name,
        questionType: 'objective'
    })},
    { type: 'name_by_location', generator: (m: Mission) => ({
        question: `Qual é o nome da missão localizada em "${m.location}"?`,
        correctAnswer: m.name,
        questionType: 'name_by_location'
    })},
];

const generateOptions = (correctAnswer: string, allMissions: Mission[], field: keyof Mission | 'name'): string[] => {
    const options = new Set<string>([correctAnswer]);
    const otherMissions = shuffle(allMissions);
    
    for (const mission of otherMissions) {
        if (options.size === 4) break;
        const value = field === 'name' ? mission.name : String(mission[field]);
        if (value) options.add(value);
    }
    
    while (options.size < 4) {
        options.add(`Opção Falsa ${options.size}`);
    }

    return shuffle(Array.from(options));
};

type GameState = 'loading' | 'team-selection' | 'pre-game' | 'spinning-roulette' | 'playing' | 'pass-or-repass' | 'repass-answer' | 'finished';
type Team = 'azul' | 'amarelo';

const teamConfig = {
    azul: { name: "Time Azul", colors: "bg-blue-500 text-white", ring: "ring-blue-500" },
    amarelo: { name: "Time Amarelo", colors: "bg-yellow-400 text-black", ring: "ring-yellow-400" },
};

const ScoreDisplay = ({ score, lastChange }: { score: number, lastChange: number | null }) => {
    const [displayScore, setDisplayScore] = useState(score);
    const [changeAnim, setChangeAnim] = useState<{ change: number, key: number } | null>(null);

    useEffect(() => {
        if (lastChange !== null) {
            setChangeAnim({ change: lastChange, key: Date.now() });
            const timer = setTimeout(() => setChangeAnim(null), 1500);
            setDisplayScore(score);
            return () => clearTimeout(timer);
        }
    }, [score, lastChange]);

    return (
        <div className="relative">
            <span className="text-6xl font-bold">{displayScore}</span>
            {changeAnim && (
                <span 
                    key={changeAnim.key} 
                    className={cn(
                        "absolute -top-8 right-0 text-3xl font-bold animate-ping-once",
                        changeAnim.change > 0 ? "text-green-500" : "text-red-500"
                    )}
                >
                    {changeAnim.change > 0 ? `+${changeAnim.change}` : changeAnim.change}
                </span>
            )}
        </div>
    );
};


export default function MissionsQuizPage() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [showCorrect, setShowCorrect] = useState(false);
    const [isRulesOpen, setIsRulesOpen] = useState(false);


    const [gameState, setGameState] = useState<GameState>('loading');
    const [teams, setTeams] = useState<{ azul: string[], amarelo: string[] } | null>(null);
    const [scores, setScores] = useState({ azul: 0, amarelo: 0 });
    const [lastScoreChanges, setLastScoreChanges] = useState<{ azul: number | null, amarelo: number | null }>({ azul: null, amarelo: null });
    const [currentTurn, setCurrentTurn] = useState<Team | null>(null);
    const [winner, setWinner] = useState<Team | 'empate' | null>(null);

    // --- Roulette State ---
    const [rouletteResult, setRouletteResult] = useState<Team | null>(null);
    const [rouletteRotation, setRouletteRotation] = useState(0);

    const generateQuestions = useCallback((loadedMissions: Mission[]): QuizQuestion[] => {
        if (loadedMissions.length < 4) return [];
        let generatedQuestions: QuizQuestion[] = [];
        const usedQuestions = new Set<string>();

        const getOptionsForTemplate = (mission: Mission, type: string): string[] => {
            switch (type) {
                case 'points': return generateOptions(mission.points.toString(), loadedMissions, 'points');
                case 'location': return generateOptions(mission.location, loadedMissions, 'location');
                case 'priority': return shuffle([...priorities]);
                case 'objective': return generateOptions(mission.name, loadedMissions, 'name');
                case 'name_by_location': return generateOptions(mission.name, loadedMissions, 'name');
                default: return [];
            }
        };

        while (generatedQuestions.length < TOTAL_QUESTIONS && loadedMissions.length > 0) {
            const mission = loadedMissions[Math.floor(Math.random() * loadedMissions.length)];
            const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
            
            const { question, correctAnswer, questionType } = template.generator(mission);
            
            if (!usedQuestions.has(question)) {
                const options = getOptionsForTemplate(mission, template.type);
                if (options.length === 4) {
                    generatedQuestions.push({
                        id: `${mission.id}-${template.type}-${generatedQuestions.length}`,
                        question,
                        options,
                        correctAnswer,
                        imageUrl: mission.imageUrl || null,
                        questionType,
                    });
                    usedQuestions.add(question);
                }
            }
        }
        return generatedQuestions;
    }, []);

    useEffect(() => {
        try {
            const savedMissions = localStorage.getItem('missions');
            if (savedMissions) {
                const loadedMissions = JSON.parse(savedMissions);
                setMissions(loadedMissions);
                if (loadedMissions.length < 4) {
                    setGameState('loading');
                    return;
                }
                setQuestions(generateQuestions(loadedMissions));
                setGameState('team-selection');
            }
        } catch (error) {
            console.error("Failed to load missions", error);
        }
    }, [generateQuestions]);

    const handleAnswerSelect = (option: string) => {
        if (isAnswered) return;
        setSelectedAnswer(option);
        setIsAnswered(true);

        const isCorrect = option === questions[currentQuestionIndex].correctAnswer;
        
        if (isCorrect) {
            setShowCorrect(true);
            setTimeout(() => {
                setScores(prev => ({ ...prev, [currentTurn!]: prev[currentTurn!] + 1 }));
                setLastScoreChanges({ azul: null, amarelo: null, [currentTurn!]: 1 });
                handleNextQuestion();
            }, 1500);
        } else {
             setShowCorrect(false); 
             setGameState('pass-or-repass');
        }
    };

    const handlePassRepass = (accepted: boolean) => {
        const otherTeam = currentTurn === 'azul' ? 'amarelo' : 'azul';
        if (accepted) {
            setIsAnswered(false);
            setSelectedAnswer(null);
            setCurrentTurn(otherTeam);
            setGameState('repass-answer');
        } else {
            const originalTeam = currentTurn!;
            setScores(prev => ({ ...prev, [originalTeam]: prev[originalTeam] - 1 }));
            setLastScoreChanges({ azul: null, amarelo: null, [originalTeam]: -1 });
            setShowCorrect(true);
            setTimeout(handleNextQuestion, 2000);
        }
    };
    
    const handleRepassAnswer = (option: string) => {
         if (isAnswered) return;
         setSelectedAnswer(option);
         setIsAnswered(true);
         setShowCorrect(true);
         const isCorrect = option === questions[currentQuestionIndex].correctAnswer;
         const teamThatRepassed = currentTurn!;
         const originalTeam = teamThatRepassed === 'azul' ? 'amarelo' : 'azul';
         
         setTimeout(() => {
            if (isCorrect) {
                setScores(prev => ({ 
                    ...prev, 
                    [teamThatRepassed]: prev[teamThatRepassed] + 1,
                    [originalTeam]: prev[originalTeam] - 1
                }));
                setLastScoreChanges({ [teamThatRepassed]: 1, [originalTeam]: -1 });
            } else {
                setScores(prev => ({ 
                    ...prev, 
                    [teamThatRepassed]: prev[teamThatRepassed] - 1,
                    [originalTeam]: prev[originalTeam] - 1
                }));
                 setLastScoreChanges({ [teamThatRepassed]: -1, [originalTeam]: -1 });
            }
            handleNextQuestion();
         }, 2000);
    };

    const handleNextQuestion = () => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < questions.length) {
            setCurrentQuestionIndex(nextQuestionIndex);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setShowCorrect(false);
            
            if (gameState !== 'pass-or-repass') {
                 setCurrentTurn(prev => prev === 'azul' ? 'amarelo' : 'azul');
            }
            setGameState('playing');
        } else {
            if(scores.azul > scores.amarelo) setWinner('azul');
            else if (scores.amarelo > scores.azul) setWinner('amarelo');
            else setWinner('empate');
            setGameState('finished');
        }
    };
    
    const handleTeamShuffle = () => {
        const shuffledMembers = shuffle(MEMBERS);
        setTeams({
            azul: shuffledMembers.slice(0, 3),
            amarelo: shuffledMembers.slice(3, 6),
        });
    }

    const startRoulette = () => {
        setGameState('spinning-roulette');
        const spinDuration = 3000;
        const finalRotation = Math.random() * 360 + 360 * 3;
        const resultTeam = Math.random() > 0.5 ? 'azul' : 'amarelo';
        
        const resultAngle = resultTeam === 'azul' ? 0 : 180;
        const finalAngle = finalRotation - (finalRotation % 360) + resultAngle + (Math.random() * 120 - 60);

        setRouletteRotation(finalAngle);
        
        setTimeout(() => {
            setRouletteResult(resultTeam);
            setCurrentTurn(resultTeam);
            setTimeout(() => setGameState('playing'), 2000);
        }, spinDuration);
    };

    const handleRestart = () => {
        setScores({ azul: 0, amarelo: 0 });
        setLastScoreChanges({ azul: null, amarelo: null });
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setShowCorrect(false);
        setCurrentTurn(null);
        setWinner(null);
        setTeams(null);
        setQuestions(generateQuestions(missions));
        setGameState('team-selection');
    };
    
    // --- RENDER LOGIC ---

    if (gameState === 'loading') {
        return (
             <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center">
                <Card className="w-full max-w-2xl text-center p-8">
                    <CardHeader><Skeleton className="h-8 w-3/4 mx-auto" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (gameState === 'team-selection') {
        return (
            <>
            <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center text-center">
                <Card className="w-full max-w-2xl p-8">
                    <CardHeader>
                        <CardTitle className="text-3xl">Sorteio de Times</CardTitle>
                        <CardDescription>Vamos formar as equipes para o Passa ou Repassa!</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-8">
                        {!teams ? (
                             <div className="space-y-4 w-full">
                                <div className="p-4 border rounded-lg bg-secondary/50">
                                    <h3 className="font-semibold text-lg mb-2">Participantes</h3>
                                    <p className="text-muted-foreground">{MEMBERS.join(', ')}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 w-full">
                                    <Button onClick={handleTeamShuffle} size="lg" className="w-full">
                                        <Shuffle className="mr-2" /> Sortear Times
                                    </Button>
                                    <Button size="lg" className="w-full" variant="outline" onClick={() => setIsRulesOpen(true)}>
                                        <BookOpen className="mr-2" /> Regras do Jogo
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50">
                                <Card className="p-4 bg-blue-100 dark:bg-blue-900/50">
                                    <CardTitle className="text-blue-600 dark:text-blue-400 mb-2">Time Azul</CardTitle>
                                    <ul className="space-y-1">
                                        {teams.azul.map(name => <li key={name} className="font-medium">{name}</li>)}
                                    </ul>
                                </Card>
                                 <Card className="p-4 bg-yellow-100 dark:bg-yellow-900/50">
                                    <CardTitle className="text-yellow-600 dark:text-yellow-400 mb-2">Time Amarelo</CardTitle>
                                    <ul className="space-y-1">
                                        {teams.amarelo.map(name => <li key={name} className="font-medium">{name}</li>)}
                                    </ul>
                                </Card>
                            </div>
                        )}
                    </CardContent>
                    {teams && (
                         <CardFooter>
                            <Button onClick={() => setGameState('pre-game')} className="w-full" size="lg">
                                Continuar para o Jogo
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>
             <Dialog open={isRulesOpen} onOpenChange={setIsRulesOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-center">Regras do Passa ou Repassa</DialogTitle>
                    </DialogHeader>
                    <div className="prose dark:prose-invert max-h-[70vh] overflow-y-auto p-4 space-y-4">
                        <p>Bem-vindos ao Passa ou Repassa das Missões! O objetivo é testar seus conhecimentos sobre o tapete da temporada.</p>
                        
                        <h3 className="font-bold">Início do Jogo</h3>
                        <ul className="list-disc list-outside space-y-1 pl-4">
                           <li>O jogo começa com um sorteio aleatório para formar os <strong>Times Azul e Amarelo</strong>.</li>
                           <li>Em seguida, uma roleta define qual time começará a primeira rodada.</li>
                        </ul>

                         <h3 className="font-bold">Pontuação</h3>
                        <ul className="list-disc list-outside space-y-1 pl-4">
                           <li>Cada resposta correta na sua vez vale <strong>+1 ponto</strong>.</li>
                        </ul>

                        <h3 className="font-bold">Se o seu time errar...</h3>
                        <p>A pergunta é passada para o time adversário. O time adversário tem duas opções:</p>
                        <ol className="list-decimal list-outside space-y-2 pl-4">
                           <li>
                                <strong>REPASSAR (Não responder)</strong>: 
                                <ul className="list-disc list-outside space-y-1 pl-6 mt-1">
                                     <li>Seu time (que errou primeiro) perde <strong>-1 ponto</strong>.</li>
                                     <li>Ninguém responde e o jogo segue para a próxima pergunta.</li>
                                </ul>
                           </li>
                           <li>
                                <strong>ACEITAR E RESPONDER</strong>:
                                <ul className="list-disc list-outside space-y-1 pl-6 mt-1">
                                    <li>Se o time adversário <strong>acertar</strong>, ele ganha <strong>+1 ponto</strong> e seu time perde <strong>-1 ponto</strong>.</li>
                                    <li>Se o time adversário <strong>errar</strong>, ambos os times perdem <strong>-1 ponto</strong>.</li>
                                </ul>
                           </li>
                        </ol>
                        
                        <p className="font-bold text-center pt-4">Boa sorte e que vença o melhor!</p>
                    </div>
                </DialogContent>
            </Dialog>
            </>
        );
    }
    
     if (gameState === 'pre-game' || gameState === 'spinning-roulette') {
        return (
             <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center text-center">
                 <Card className="w-full max-w-lg p-8">
                    <CardHeader>
                        <CardTitle className="text-3xl">Passa ou Repassa: Missões</CardTitle>
                        <CardDescription>Gire a roleta para decidir quem começa!</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-8">
                        <div className="relative w-48 h-48 border-8 border-gray-300 rounded-full flex items-center justify-center">
                            <div className="absolute w-full h-full" style={{ transform: `rotate(${rouletteRotation}deg)`, transition: 'transform 3s cubic-bezier(0.25, 1, 0.5, 1)' }}>
                                <div className="absolute w-1/2 h-full bg-blue-500 rounded-l-full" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}></div>
                                <div className="absolute w-1/2 h-full left-1/2 bg-yellow-400 rounded-r-full" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}></div>
                            </div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-0 h-0 border-x-8 border-x-transparent border-t-12 border-t-red-600 z-10" style={{borderTopWidth: '12px'}}></div>
                        </div>
                        {rouletteResult ? (
                           <p className="text-2xl font-bold animate-bounce">O time <span className={cn(teamConfig[rouletteResult].colors, "px-2 py-1 rounded")}>{teamConfig[rouletteResult].name}</span> começa!</p>
                        ) : (
                           <Button onClick={startRoulette} disabled={gameState === 'spinning-roulette'}>
                                {gameState === 'spinning-roulette' ? "Girando..." : "Girar Roleta"}
                            </Button>
                        )}
                    </CardContent>
                 </Card>
            </div>
        );
    }

    if (gameState === 'finished') {
        return (
            <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center text-center">
                 <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <div className="mx-auto bg-primary text-primary-foreground rounded-full p-4 w-fit mb-4 animate-pulse">
                            <Award className="w-12 h-12"/>
                        </div>
                        <CardTitle className="text-3xl">Jogo Finalizado!</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {winner !== 'empate' ? (
                            <>
                                <p className="text-xl">O vencedor é...</p>
                                <p className={cn("text-5xl font-bold my-4 px-4 py-2 rounded-lg inline-block", winner && teamConfig[winner].colors)}>
                                    {winner && teamConfig[winner].name}!
                                </p>
                            </>
                       ) : (
                           <p className="text-4xl font-bold my-4">EMPATE!</p>
                       )}
                       <div className="flex justify-around items-center mt-4">
                           <div className="text-blue-500">
                               <p className="font-semibold">Placar Final Azul</p>
                               <p className="text-4xl font-bold">{scores.azul}</p>
                           </div>
                           <div className="text-yellow-500">
                               <p className="font-semibold">Placar Final Amarelo</p>
                               <p className="text-4xl font-bold">{scores.amarelo}</p>
                           </div>
                       </div>
                    </CardContent>
                    <CardFooter className="flex-col sm:flex-row gap-2">
                        <Button onClick={handleRestart} className="w-full">Jogar Novamente</Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/missions">Voltar para Missões</Link>
                        </Button>
                    </CardFooter>
                 </Card>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
        return (
             <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center text-center">
                <Card className="w-full max-w-2xl p-8">
                     <CardTitle className="text-2xl mb-4">Erro ao Carregar Quiz</CardTitle>
                     <p className="text-muted-foreground mb-4">Não foi possível gerar as perguntas. Verifique se você tem pelo menos 4 missões cadastradas.</p>
                      <Button variant="outline" asChild>
                        <Link href="/missions">Voltar para Missões</Link>
                      </Button>
                </Card>
             </div>
        )
    }
    
    const progress = ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;
    const isRepassQuestion = currentQuestion.questionType === 'objective' || currentQuestion.questionType === 'name_by_location';

    return (
        <div className="flex-1 p-4 md:p-8 flex flex-col items-center">
            {/* Scoreboard */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-6xl mb-8">
                 <Card className={cn("text-center p-6 transition-all ring-4 ring-transparent", currentTurn === 'azul' && teamConfig.azul.ring)}>
                     <CardTitle>{teamConfig.azul.name}</CardTitle>
                     <ScoreDisplay score={scores.azul} lastChange={lastScoreChanges.azul}/>
                 </Card>
                 <Card className={cn("text-center p-6 transition-all ring-4 ring-transparent", currentTurn === 'amarelo' && teamConfig.amarelo.ring)}>
                     <CardTitle>{teamConfig.amarelo.name}</CardTitle>
                     <ScoreDisplay score={scores.amarelo} lastChange={lastScoreChanges.amarelo}/>
                 </Card>
            </div>

            {/* Game Area */}
             <div className="w-full max-w-4xl space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center mb-4">
                            <CardTitle className="flex items-center gap-2">
                                <BrainCircuit className="w-6 h-6"/> Pergunta
                            </CardTitle>
                            <div className="text-lg font-bold">
                                {currentQuestionIndex + 1} / {TOTAL_QUESTIONS}
                            </div>
                        </div>
                         <Progress value={progress} />
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-full md:w-1/3 aspect-video rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
                            {currentQuestion.imageUrl && !isRepassQuestion ? (
                                <Image src={currentQuestion.imageUrl} alt="Imagem da Missão" width={300} height={169} className="object-cover w-full h-full" />
                            ) : (
                                isRepassQuestion ? <HelpCircle className="w-24 h-24 text-muted-foreground" /> : <Star className="w-16 h-16 text-muted-foreground" />
                            )}
                        </div>
                        <p className="text-center font-semibold text-xl md:text-2xl min-h-[6rem] flex items-center justify-center flex-1">
                            {currentQuestion.question}
                        </p>
                    </CardContent>
                </Card>
                
                 {gameState === 'pass-or-repass' && (
                     <Card className="p-6 text-center animate-in fade-in-50">
                        <CardHeader>
                             <CardTitle className="flex items-center justify-center gap-2">
                                <ShieldQuestion className="w-8 h-8"/> 
                                <span className={cn(teamConfig[currentTurn === 'azul' ? 'amarelo' : 'azul'].colors, "px-2 py-1 rounded-lg")}>
                                    {teamConfig[currentTurn === 'azul' ? 'amarelo' : 'azul'].name}
                                </span>
                                , e agora?
                             </CardTitle>
                             <CardDescription>O time adversário errou! Vocês aceitam responder valendo pontos?</CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-4 justify-center">
                             <Button size="lg" onClick={() => handlePassRepass(true)}>Sim, nós respondemos!</Button>
                             <Button size="lg" variant="destructive" onClick={() => handlePassRepass(false)}>Não, vamos passar.</Button>
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground pt-4 justify-center">
                            Se aceitar e errar, ambos perdem 1 ponto. Se acertar, você ganha 1 e o outro time perde 1. Se passar, o outro time perde 1 ponto.
                        </CardFooter>
                     </Card>
                 )}
                
                 {(gameState === 'playing' || gameState === 'repass-answer') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => {
                            const isCorrect = option === currentQuestion.correctAnswer;
                            const isSelected = option === selectedAnswer;

                            return (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className={cn(
                                        "h-auto py-4 text-lg whitespace-normal justify-start",
                                        showCorrect && isCorrect && "bg-green-100 border-green-500 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
                                        showCorrect && isSelected && !isCorrect && "bg-red-100 border-red-500 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
                                    )}
                                    onClick={() => gameState === 'repass-answer' ? handleRepassAnswer(option) : handleAnswerSelect(option)}
                                    disabled={isAnswered}
                                >
                                    <span className={cn(
                                        "mr-4 h-8 w-8 rounded-md border flex items-center justify-center shrink-0",
                                        showCorrect && isCorrect && "bg-green-500 text-white border-green-500",
                                        showCorrect && isSelected && !isCorrect && "bg-red-500 text-white border-red-500"
                                    )}>
                                        {showCorrect ? (isCorrect ? <Check /> : <IconX />) : String.fromCharCode(65 + index)}
                                    </span>
                                    {option}
                                </Button>
                            )
                        })}
                    </div>
                 )}
             </div>
        </div>
    )
}
