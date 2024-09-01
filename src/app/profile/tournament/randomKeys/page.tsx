/**
 * v0 by Vercel.
 * @see https://v0.dev/t/6aWVYKaskWx
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

export default function Component() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto py-12 px-4 md:px-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Gerador de Chaves de Competição</h1>
        <p className="text-muted-foreground">Crie facilmente as chaves de competições amistosas com este sistema.</p>
      </div>
      <div className="w-full mt-8 bg-background rounded-lg border p-6 space-y-6">
        <form className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Competição</Label>
            <Input id="name" placeholder="Digite o nome da competição" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Data da Competição</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start font-normal">
                  Selecione a data
                  <div className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="teams">Número de Times</Label>
            <Input id="teams" type="number" placeholder="Digite o número de times" />
          </div>
          <div className="space-y-2 flex items-end">
            <Button type="submit" className="w-full">
              Gerar Chaves
            </Button>
          </div>
        </form>
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Confronto</TableHead>
                <TableHead>Time 1</TableHead>
                <TableHead>Time 2</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Quartas de Final</TableCell>
                <TableCell>Time A</TableCell>
                <TableCell>Time B</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Quartas de Final</TableCell>
                <TableCell>Time C</TableCell>
                <TableCell>Time D</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Semifinal</TableCell>
                <TableCell>Vencedor A x B</TableCell>
                <TableCell>Vencedor C x D</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Final</TableCell>
                <TableCell>Vencedor Semifinal 1</TableCell>
                <TableCell>Vencedor Semifinal 2</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}