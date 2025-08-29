
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Mission, priorities } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, BrainCircuit, Check, X as IconX } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
}

const TOTAL_QUESTIONS = 50;

const questionTemplates = [
    // Points
    { type: 'points', generator: (m: Mission, allMissions: Mission[]) => ({
        question: `Qual é a pontuação da missão "${m.name}"?`,
        correctAnswer: m.points.toString(),
        options: shuffle([
            m.points.toString(),
            ...shuffle(allMissions.filter(om => om.id !== m.id)).slice(0, 3).map(om => om.points.toString())
        ])
    })},
    // Location
    { type: 'location', generator: (m: Mission, allMissions: Mission[]) => ({
        question: `Onde a missão "${m.name}" está localizada?`,
        correctAnswer: m.location,
        options: shuffle([
            m.location,
            ...shuffle(allMissions.filter(om => om.id !== m.id)).slice(0, 3).map(om => om.location)
        ])
    })},
    // Priority
    { type: 'priority', generator: (m: Mission, allMissions: Mission[]) => ({
        question: `Qual a prioridade da missão "${m.name}"?`,
        correctAnswer: m.priority,
        options: shuffle([...priorities])
    })},
    // Objective (Description)
    { type: 'objective', generator: (m: Mission, allMissions: Mission[]) => ({
        question: `Qual missão tem o objetivo: "${m.description.substring(0, 50)}..."?`,
        correctAnswer: m.name,
        options: shuffle([
            m.name,
            ...shuffle(allMissions.filter(om => om.id !== m.id)).slice(0, 3).map(om => om.name)
        ])
    })},
     // Name by location
    { type: 'name_by_location', generator: (m: Mission, allMissions: Mission[]) => ({
        question: `Qual é o nome da missão localizada em "${m.location}"?`,
        correctAnswer: m.name,
        options: shuffle([
            m.name,
            ...shuffle(allMissions.filter(om => om.id !== m.id)).slice(0, 3).map(om => om.name)
        ])
    })},
];

export default function MissionsQuizPage() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [gameState, setGameState] = useState<'loading' | 'playing' | 'finished'>('loading');

    const generateQuestions = useCallback((loadedMissions: Mission[]): QuizQuestion[] => {
        if (loadedMissions.length < 4) return [];
        let generatedQuestions: QuizQuestion[] = [];
        const usedQuestions = new Set<string>();

        while (generatedQuestions.length < TOTAL_QUESTIONS) {
            const mission = loadedMissions[Math.floor(Math.random() * loadedMissions.length)];
            const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
            
            const q = template.generator(mission, loadedMissions);
            
            // Ensure 4 unique options
            const uniqueOptions = Array.from(new Set(q.options));
            if (uniqueOptions.length < 4) {
                 const otherOptions = shuffle(loadedMissions.map(m => m.name)).filter(n => !uniqueOptions.includes(n));
                 while(uniqueOptions.length < 4 && otherOptions.length > 0) {
                     uniqueOptions.push(otherOptions.pop()!);
                 }
            }

            const finalQuestion: QuizQuestion = {
                id: `${mission.id}-${template.type}-${generatedQuestions.length}`,
                question: q.question,
                options: shuffle(uniqueOptions.slice(0, 4)),
                correctAnswer: q.correctAnswer
            };
            
            if (!usedQuestions.has(finalQuestion.question)) {
                 generatedQuestions.push(finalQuestion);
                 usedQuestions.add(finalQuestion.question);
            }
        }
        return generatedQuestions;
    }, []);

    useEffect(() => {
        try {
            const savedMissions = localStorage.getItem('missions');
            if (savedMissions) {
                const loadedMissions = JSON.parse(savedMissions);
                if (loadedMissions.length < 4) {
                    // Not enough data to create a meaningful quiz
                    setGameState('loading'); // Or a new 'error' state
                    return;
                }
                setMissions(loadedMissions);
                const generated = generateQuestions(loadedMissions);
                setQuestions(generated);
                setGameState('playing');
            }
        } catch (error) {
            console.error("Failed to load missions", error);
        }
    }, [generateQuestions]);

    const handleAnswerSelect = (option: string) => {
        if (isAnswered) return;
        setSelectedAnswer(option);
        setIsAnswered(true);

        if (option === questions[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setGameState('finished');
        }
    };
    
    const handleRestart = () => {
        setScore(0);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setQuestions(generateQuestions(missions));
        setGameState('playing');
    }

    if (gameState === 'loading') {
        return (
             <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
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
                        <div className="mx-auto bg-primary text-primary-foreground rounded-full p-4 w-fit mb-4">
                            <Award className="w-12 h-12"/>
                        </div>
                        <CardTitle className="text-3xl">Quiz Finalizado!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl">Sua pontuação final foi:</p>
                        <p className="text-6xl font-bold my-4 text-primary">{score} <span className="text-2xl text-muted-foreground">/ {TOTAL_QUESTIONS}</span></p>
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

    return (
        <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center">
             <div className="w-full max-w-4xl space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center mb-4">
                            <CardTitle className="flex items-center gap-2">
                                <BrainCircuit className="w-6 h-6"/> Quiz das Missões
                            </CardTitle>
                            <div className="text-lg font-bold">
                                {currentQuestionIndex + 1} / {TOTAL_QUESTIONS}
                            </div>
                        </div>
                         <Progress value={progress} />
                    </CardHeader>
                    <CardContent>
                        <p className="text-center font-semibold text-xl md:text-2xl min-h-[6rem] flex items-center justify-center">
                            {currentQuestion.question}
                        </p>
                    </CardContent>
                </Card>
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
                                    isAnswered && isCorrect && "bg-green-100 border-green-500 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
                                    isAnswered && isSelected && !isCorrect && "bg-red-100 border-red-500 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
                                )}
                                onClick={() => handleAnswerSelect(option)}
                                disabled={isAnswered}
                            >
                                <span className={cn(
                                    "mr-4 h-8 w-8 rounded-md border flex items-center justify-center shrink-0",
                                    isAnswered && isCorrect && "bg-green-500 text-white border-green-500",
                                    isAnswered && isSelected && !isCorrect && "bg-red-500 text-white border-red-500"
                                )}>
                                    {isAnswered ? (isCorrect ? <Check /> : <IconX />) : index + 1}
                                </span>
                                {option}
                            </Button>
                        )
                    })}
                </div>
                 {isAnswered && (
                     <div className="text-center pt-4">
                        <Button onClick={handleNextQuestion}>
                            {currentQuestionIndex < questions.length - 1 ? "Próxima Pergunta" : "Finalizar Quiz"}
                        </Button>
                     </div>
                 )}
             </div>
        </div>
    )
}
