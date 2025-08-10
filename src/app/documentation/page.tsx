import { Button } from "@/components/ui/button";
import { FileText, Sheet } from "lucide-react";
import Link from "next/link";

export default function DocumentationPage() {
  const driveFolderId = "1CdrLez4Saz7_HES30UyokJGBguoAiG7D";
  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${driveFolderId}#grid`;

  return (
    <div className="flex flex-col flex-1 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Documentação</h1>
        <p className="text-muted-foreground">
          Visualização dos arquivos e pastas do Google Drive.
        </p>
      </header>
      <div className="flex-1 border rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allow="fullscreen"
        ></iframe>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <Button asChild>
          <Link href="https://docs.google.com/document/create" target="_blank">
            <FileText className="mr-2 h-4 w-4" />
            Novo Documento
          </Link>
        </Button>
        <Button asChild>
          <Link href="https://sheets.google.com/create" target="_blank">
            <Sheet className="mr-2 h-4 w-4" />
            Nova Planilha
          </Link>
        </Button>
      </div>
    </div>
  );
}
