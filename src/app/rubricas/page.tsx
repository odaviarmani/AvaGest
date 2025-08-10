import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const innovationProjectData = [
    {
        criterion: "IDENTIFY – Time definiu o problema com clareza e foi bem pesquisado?",
        levels: {
            Beginning: "Definição do problema pouco clara / pesquisa mínima.",
            Developing: "Definição parcialmente clara / evidência de pesquisa de uma ou mais fontes.",
            Accomplished: "Definição clara / pesquisa detalhada de várias fontes.",
            Exceeds: "Se marcou, precisa comentar sobre como se excedeu."
        }
    },
    {
        criterion: "DESIGN – Trabalharam juntos e montaram um plano de projeto legal?",
        levels: {
            Beginning: "Pouca evidência de plano.",
            Developing: "Plano eficaz básico.",
            Accomplished: "Plano eficaz claro; desenvolvimento envolvendo todo o time em níveis baixos, médios, altos."
        }
    },
    {
        criterion: "CREATE – Ideia original com protótipo ou desenho que represente bem?",
        levels: {
            Beginning: "Pouca explicação.",
            Developing: "Explicação simples.",
            Accomplished: "Explicação detalhada; similar para modelo/desenho do protótipo."
        }
    },
    {
        criterion: "ITERATE – Compartilharam, pegaram feedback e melhoraram?",
        levels: {
            Beginning: "Pouca partilha / nenhuma melhoria evidenciada.",
            Developing: "Partilhado com uma pessoa/grupo / melhorias parciais.",
            Accomplished: "Partilhado com vários / melhorias claras."
        }
    },
    {
        criterion: "COMMUNICATE – Apresentaram a solução, impacto e mostraram orgulho?",
        levels: {
            Beginning: "Explicação confusa / sem empolgação.",
            Developing: "Explicação parcialmente clara / entusiasmo parcial.",
            Accomplished: "Explicação clara / entusiasmo evidente."
        }
    }
];

const robotDesignData = [
    {
        criterion: "IDENTIFY – Escolheram missões, pesquisaram e buscaram ajuda?",
        levels: {
            Beginning: "Estratégia de missão mínima / uso de recursos mínimo.",
            Developing: "Estratégia parcial / uso de recursos moderado.",
            Accomplished: "Estratégia clara / uso claro de recursos para apoiar missão."
        }
    },
    {
        criterion: "DESIGN – Todos contribuíram com ideias e desenvolveram habilidades de construção e programação?",
        levels: {
            Beginning: "Pouca participação.",
            Developing: "Participação parcial.",
            Accomplished: "Participação clara e compartilhada + habilidades desenvolvidas."
        }
    },
    {
        criterion: "CREATE – Explicaram bem anexos, código e sensores de forma inovadora?",
        levels: {
            Beginning: "Explicação confusa.",
            Developing: "Explicação simples.",
            Accomplished: "Explicação clara e inovadora dos anexos, código e sensores."
        }
    },
    {
        criterion: "ITERATE – Testaram e melhoraram com base nos testes?",
        levels: {
            Beginning: "Pouca evidência de testes / melhorias.",
            Developing: "Testes e melhorias parciais.",
            Accomplished: "Testes repetidos e melhorias claras com base nos testes."
        }
    },
    {
        criterion: "COMMUNICATE – Contaram o processo e mostraram orgulho do trabalho?",
        levels: {
            Beginning: "Explicação confusa / pouca empolgação.",
            Developing: "Explicação simples / empolgação parcial.",
            Accomplished: "Explicação detalhada / orgulho evidente."
        }
    }
];

const RubricTable = ({ title, data }: { title: string, data: typeof innovationProjectData }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[30%]">Critério</TableHead>
                        <TableHead>Níveis</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium align-top">{item.criterion}</TableCell>
                            <TableCell>
                                <ul className="space-y-2">
                                    {Object.entries(item.levels).map(([level, description]) => (
                                        <li key={level} className="flex items-start gap-2">
                                            <Badge variant={
                                                level === 'Beginning' ? 'destructive' : 
                                                level === 'Developing' ? 'secondary' :
                                                level === 'Accomplished' ? 'default' :
                                                'outline'
                                            } className="mt-1 whitespace-nowrap">{level}</Badge>
                                            <span>{description}</span>
                                        </li>
                                    ))}
                                </ul>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

export default function RubricasPage() {
    return (
        <div className="flex-1 p-4 md:p-8 space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Rubricas de Avaliação</h1>
                <p className="text-muted-foreground">
                    Consulte as rubricas oficiais da temporada para o Innovation Project e Robot Design.
                </p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <RubricTable title="Innovation Project" data={innovationProjectData} />
                <RubricTable title="Robot Design" data={robotDesignData} />
            </div>
        </div>
    );
}