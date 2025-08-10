"use client";

import RubricTable from "@/components/rubricas/RubricTable";

const innovationProjectData = [
    { id: "identify", criterion: "IDENTIFY – A equipe definiu claramente um problema bem pesquisado?" },
    { id: "design", criterion: "DESIGN – Eles trabalharam juntos para criar um bom plano de projeto?" },
    { id: "create", criterion: "CREATE – A ideia é original com um protótipo ou desenho que a represente bem?" },
    { id: "iterate", criterion: "ITERATE – Eles compartilharam, receberam feedback e melhoraram?" },
    { id: "communicate", criterion: "COMMUNICATE – Eles apresentaram a solução, o impacto e demonstraram orgulho?" },
];

const robotDesignData = [
    { id: "identify", criterion: "IDENTIFY – Eles escolheram missões, pesquisaram e buscaram ajuda?" },
    { id: "design", criterion: "DESIGN – Todos contribuíram com ideias e desenvolveram habilidades de construção/programação?" },
    { id: "create", criterion: "CREATE – Eles explicaram claramente os anexos, o código e os sensores de forma inovadora?" },
    { id: "iterate", criterion: "ITERATE – Eles testaram e melhoraram com base nos resultados?" },
    { id: "communicate", criterion: "COMMUNICATE – Eles explicaram seu processo e demonstraram orgulho em seu trabalho?" },
];


export default function RubricasPage() {
    return (
        <div className="flex-1 p-4 md:p-8 space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Rubricas de Avaliação</h1>
                <p className="text-muted-foreground">
                    Consulte as rubricas oficiais da temporada para o Projeto de Inovação e o Design do Robô.
                </p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <RubricTable title="Projeto de Inovação" data={innovationProjectData} storageKey="innovationProjectScores" />
                <RubricTable title="Design do Robô" data={robotDesignData} storageKey="robotDesignScores" />
            </div>
        </div>
    );
}
