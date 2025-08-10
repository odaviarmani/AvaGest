"use client";

import RubricTable from "@/components/rubricas/RubricTable";

const innovationProjectData = [
    { id: "identify", criterion: "IDENTIFY – Did the team clearly define a well-researched problem?" },
    { id: "design", criterion: "DESIGN – Did they work together to create a good project plan?" },
    { id: "create", criterion: "CREATE – Is the idea original with a prototype or drawing that represents it well?" },
    { id: "iterate", criterion: "ITERATE – Did they share, get feedback, and improve?" },
    { id: "communicate", criterion: "COMMUNICATE – Did they present the solution, impact, and show pride?" },
];

const robotDesignData = [
    { id: "identify", criterion: "IDENTIFY – Did they choose missions, research, and seek help?" },
    { id: "design", criterion: "DESIGN – Did everyone contribute ideas and develop building/programming skills?" },
    { id: "create", criterion: "CREATE – Did they clearly explain attachments, code, and sensors in an innovative way?" },
    { id: "iterate", criterion: "ITERATE – Did they test and improve based on the results?" },
    { id: "communicate", criterion: "COMMUNICATE – Did they explain their process and show pride in their work?" },
];


export default function RubricasPage() {
    return (
        <div className="flex-1 p-4 md:p-8 space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Evaluation Rubrics</h1>
                <p className="text-muted-foreground">
                    Consult the official season rubrics for the Innovation Project and Robot Design.
                </p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <RubricTable title="Innovation Project" data={innovationProjectData} storageKey="innovationProjectScores" />
                <RubricTable title="Robot Design" data={robotDesignData} storageKey="robotDesignScores" />
            </div>
        </div>
    );
}
