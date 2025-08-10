"use client";

import RubricTable from "@/components/rubricas/RubricTable";

const innovationProjectData = [
    { id: "ip_identify_1", criterion: "IDENTIFY 1 – A equipe definiu claramente um problema bem pesquisado que é relevante para o tema da temporada?" },
    { id: "ip_identify_2", criterion: "IDENTIFY 2 – A equipe coletou informações de uma variedade de fontes para desenvolver uma compreensão completa do problema?" },
    { id: "ip_design_1", criterion: "DESIGN 1 – A equipe gerou ideias inovadoras e desenvolveu um plano de projeto abrangente?" },
    { id: "ip_design_2", criterion: "DESIGN 2 – A equipe usou suas habilidades de colaboração para garantir que todos os membros da equipe estivessem envolvidos no desenvolvimento da solução?" },
    { id: "ip_create_1", criterion: "CREATE 1 – A equipe desenvolveu uma solução original e criou um protótipo ou modelo para representar sua ideia?" },
    { id: "ip_create_2", criterion: "CREATE 2 – A equipe demonstrou um bom entendimento de como sua solução poderia ser implementada no mundo real?" },
    { id: "ip_iterate_1", criterion: "ITERATE 1 – A equipe compartilhou sua solução com outras pessoas para obter feedback e testou seu protótipo?" },
    { id: "ip_iterate_2", criterion: "ITERATE 2 – A equipe usou o feedback e os resultados dos testes para iterar e melhorar sua solução?" },
    { id: "ip_communicate_1", criterion: "COMMUNICATE 1 – A equipe apresentou sua solução de forma clara e eficaz, explicando o problema, sua solução e seu impacto potencial?" },
    { id: "ip_communicate_2", criterion: "COMMUNICATE 2 – A equipe demonstrou orgulho e entusiasmo pelo seu trabalho e pela solução que desenvolveram?" },
];

const robotDesignData = [
    { id: "rd_identify_1", criterion: "IDENTIFY 1 – A equipe escolheu missões, desenvolveu uma estratégia clara e pesquisou regras e recursos para apoiar sua estratégia?" },
    { id: "rd_identify_2", criterion: "IDENTIFY 2 – A equipe buscou ajuda de outras pessoas, como mentores ou especialistas, para desenvolver suas habilidades e conhecimentos?" },
    { id: "rd_design_1", criterion: "DESIGN 1 – A equipe projetou um robô que é mecanicamente sólido, durável e confiável?" },
    { id: "rd_design_2", criterion: "DESIGN 2 – A equipe garantiu que todos os membros da equipe contribuíssem com ideias e desenvolvessem habilidades de construção e programação?" },
    { id: "rd_create_1", criterion: "CREATE 1 – A equipe explicou claramente como seus anexos, código e uso de sensores funcionam para completar as missões de forma inovadora?" },
    { id: "rd_create_2", criterion: "CREATE 2 – O robô da equipe inclui recursos ou funcionalidades inovadoras que o diferenciam de outros robôs?" },
    { id: "rd_iterate_1", criterion: "ITERATE 1 – A equipe testou seu robô e programas repetidamente para identificar áreas de melhoria?" },
    { id: "rd_iterate_2", criterion: "ITERATE 2 – A equipe usou os resultados de seus testes para fazer melhorias claras em seu robô e programas?" },
    { id: "rd_communicate_1", criterion: "COMMUNICATE 1 – A equipe explicou claramente seu processo de design do robô, incluindo sucessos, fracassos e como superaram os desafios?" },
    { id: "rd_communicate_2", criterion: "COMMUNICATE 2 – A equipe demonstrou orgulho e entusiasmo pelo seu robô e pelo trabalho que realizaram?" },
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
                <RubricTable title="Projeto de Inovação" data={innovationProjectData} storageKey="innovationProjectScores_v2" />
                <RubricTable title="Design do Robô" data={robotDesignData} storageKey="robotDesignScores_v2" />
            </div>
        </div>
    );
}
