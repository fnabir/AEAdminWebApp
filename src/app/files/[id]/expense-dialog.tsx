import InputText from '@/components/generic/input-text';
import Separator from '@/components/generic/separator';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { updateFileExpense } from '@/lib/functions';
import { expenseDataType } from '@/lib/types';
import { DataSnapshot } from 'firebase/database';
import { useEffect, useState } from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';

interface ExpenseDialogProps {
  fileNo: number;
  fileYear: number;
  type: 'port' | 'custom' | 'other' | 'delivery';
  data: DataSnapshot[] | undefined;
  title: string;
}

const ExpenseDialog = ({
  fileNo,
  fileYear,
  type,
  data,
  title,
}: ExpenseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [dataSets, setDataSets] = useState<expenseDataType[]>([
    { id: 1, details: '', value: 0 },
  ]);

  const maxLength = type === 'port' ? 10 : 3;

  const insertRow = (id: number) => {
    if (dataSets.length >= maxLength) return;

    setDataSets((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      const newItem = { id: Date.now(), details: '', value: 0 };

      const updated = [...prev];
      updated.splice(index + 1, 0, newItem);
      return updated;
    });
  };

  const deleteRow = (id: number) => {
    if (dataSets.length === 1) return;

    setDataSets((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDataChange = (
    id: number,
    field: 'details' | 'value',
    value: string | number,
  ) => {
    setDataSets((prev) =>
      prev.map((set) => (set.id === id ? { ...set, [field]: value } : set)),
    );
  };

  const handleSubmit = () => {
    updateFileExpense(fileNo, fileYear, type, dataSets).finally(() => {
      setOpen(false);
    });
  };

  useEffect(() => {
    if (data && data.length > 0) {
      const loadedData = data.map((item, index) => {
        const snapshot = item.val();
        return {
          id: index + 1,
          details: snapshot.details || '',
          value: snapshot.value || 0,
        };
      });
      setDataSets(loadedData);
    }
  }, [data]);

  console.log(dataSets);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{title}</Button>
      </DialogTrigger>
      <DialogContent className={'border border-accent'}>
        <DialogHeader>
          <DialogTitle>{`${title} Expenses`}</DialogTitle>
          <DialogDescription>
            Click submit to update the expenses
          </DialogDescription>
        </DialogHeader>
        <Separator orientation={'horizontal'} />
        <form className="flex-col text-center" onSubmit={() => handleSubmit()}>
          {dataSets.map((set, index) => (
            <div key={set.id} className="flex flex-row gap-x-2 items-baseline">
              <InputText
                label={`Details ${index + 1}`}
                className={`flex-[0.72]`}
                defaultValue={dataSets[index].details}
                onChange={(e) => {
                  handleDataChange(set.id, 'details', e.target.value);
                }}
              />
              <InputText
                label={`Amount ${index + 1}`}
                type="number"
                pre={`৳`}
                className={`flex-[0.28]`}
                step={0.01}
                defaultValue={dataSets[index].value}
                onChange={(e) =>
                  handleDataChange(set.id, 'value', Number(e.target.value))
                }
              />
              {dataSets.length < maxLength && (
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  onClick={() => insertRow(set.id)}
                >
                  <MdAdd />
                </Button>
              )}
              {dataSets.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteRow(set.id)}
                >
                  <MdDelete />
                </Button>
              )}
            </div>
          ))}
          <DialogFooter className={'sm:justify-center pt-8 gap-4'}>
            <DialogClose asChild>
              <Button type="button" size="lg" variant="destructive">
                Close
              </Button>
            </DialogClose>
            <Button type="submit" size="lg">
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
