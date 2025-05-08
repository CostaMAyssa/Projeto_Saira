
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ScheduleSelectorProps {
  scheduleType: string;
  setScheduleType: (value: string) => void;
  scheduleDate: Date | undefined;
  setScheduleDate: (date: Date | undefined) => void;
  scheduleTime: string;
  setScheduleTime: (time: string) => void;
}

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({ 
  scheduleType,
  setScheduleType,
  scheduleDate,
  setScheduleDate,
  scheduleTime,
  setScheduleTime
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="scheduleType" className="text-pharmacy-text1">Tipo de Agendamento</Label>
        <Select value={scheduleType} onValueChange={setScheduleType}>
          <SelectTrigger className="bg-white border-pharmacy-border1">
            <SelectValue placeholder="Selecione o agendamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Diário</SelectItem>
            <SelectItem value="once">Uma vez</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {scheduleType === 'once' && (
          <div className="space-y-2">
            <Label className="text-pharmacy-text1">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-pharmacy-border1 text-pharmacy-text1"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {scheduleDate ? format(scheduleDate, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={scheduleDate}
                  onSelect={setScheduleDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="scheduleTime" className="text-pharmacy-text1">Hora</Label>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-pharmacy-text2" />
            <Input
              id="scheduleTime"
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="bg-white border-pharmacy-border1"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduleSelector;
