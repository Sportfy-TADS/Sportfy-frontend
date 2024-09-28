'use client'

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Importando o Select do ShadCN UI
import Header from "@/components/Header";

export default function Component() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [competitionName, setCompetitionName] = useState("");
  const [teams, setTeams] = useState(0);
  const [people, setPeople] = useState(0); // Para competição individual
  const [competitionType, setCompetitionType] = useState("individual"); // Novo campo
  const [confrontos, setConfrontos] = useState<any[]>([]);

  const generateKeys = async (e: React.FormEvent) => {
    e.preventDefault();

    // Lógica para competição individual
    if (competitionType === "individual" && people > 0) {
      const newConfrontos = [
        { fase: "Rodada 1", time1: "Pessoa 1", time2: "Pessoa 2" },
        { fase: "Rodada 1", time1: "Pessoa 3", time2: "Pessoa 4" },
        // Outros confrontos podem ser adicionados dinamicamente
      ];

      setConfrontos(newConfrontos);

      // Enviando os dados para o json-server
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/competitions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: competitionName,
            date: selectedDate,
            people,
            competitionType,
            confrontos: newConfrontos,
          }),
        });

        if (!res.ok) {
          throw new Error("Erro ao salvar a competição");
        }

        alert("Competição criada com sucesso!");
      } catch (error) {
        console.error("Erro ao criar competição:", error);
        alert("Erro ao criar competição.");
      }
    }

    // Lógica para competição em grupo
    if (competitionType === "grupo" && teams >= 4 && teams <= 16) {
      const newConfrontos = [
        { fase: "Quartas de Final", time1: "Time A", time2: "Time B" },
        { fase: "Quartas de Final", time1: "Time C", time2: "Time D" },
        { fase: "Semifinal", time1: "Vencedor A x B", time2: "Vencedor C x D" },
        { fase: "Final", time1: "Vencedor Semifinal 1", time2: "Vencedor Semifinal 2" },
      ];

      setConfrontos(newConfrontos);

      // Enviando os dados para o json-server
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/competitions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: competitionName,
            date: selectedDate,
            teams,
            competitionType,
            confrontos: newConfrontos,
          }),
        });

        if (!res.ok) {
          throw new Error("Erro ao salvar a competição");
        }

        alert("Competição criada com sucesso!");
      } catch (error) {
        console.error("Erro ao criar competição:", error);
        alert("Erro ao criar competição.");
      }
    } else if (competitionType === "grupo" && (teams < 4 || teams > 16)) {
      setConfrontos([]);
      alert("A competição em grupo deve ter entre 4 e 16 times.");
    }
  };

  return (
    <>
    <Header />
    
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-12 px-4 md:px-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Gerador de Chaves dos Campeonatos</h1>
          <p className="text-muted-foreground">Crie facilmente as chaves de competições amistosas com este sistema.</p>
        </div>

        <div className="w-full mt-8 bg-background rounded-lg border p-6 space-y-6">
          <form onSubmit={generateKeys} className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Competição</Label>
              <Input
                id="name"
                value={competitionName}
                onChange={(e) => setCompetitionName(e.target.value)}
                placeholder="Digite o nome da competição"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data da Competição</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    {selectedDate ? selectedDate.toLocaleDateString() : "Selecione a data"}
                    <div className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Campo Dinâmico: Individual ou Grupo */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Competição</Label>
              <Select onValueChange={setCompetitionType} value={competitionType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolha o tipo de competição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="grupo">Em Grupo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campo para número de pessoas ou times */}
            {competitionType === "individual" ? (
              <div className="space-y-2">
                <Label htmlFor="people">Número de Pessoas</Label>
                <Input
                  id="people"
                  type="number"
                  value={people}
                  onChange={(e) => setPeople(parseInt(e.target.value))}
                  placeholder="Digite o número de participantes"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="teams">Número de Times (Máximo 16)</Label>
                <Input
                  id="teams"
                  type="number"
                  value={teams}
                  onChange={(e) => setTeams(parseInt(e.target.value))}
                  placeholder="Digite o número de times"
                />
              </div>
            )}

            <div className="space-y-2 flex items-end">
              <Button type="submit" className="w-full">
                Gerar Chaves
              </Button>
            </div>
          </form>

          {/* Exibe a tabela de confrontos se houver confrontos gerados */}
          {confrontos.length > 0 && (
            <div className="border rounded-lg overflow-auto mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Confronto</TableHead>
                    <TableHead>Participante 1</TableHead>
                    <TableHead>Participante 2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {confrontos.map((confronto, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{confronto.fase}</TableCell>
                      <TableCell>{confronto.time1}</TableCell>
                      <TableCell>{confronto.time2}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

