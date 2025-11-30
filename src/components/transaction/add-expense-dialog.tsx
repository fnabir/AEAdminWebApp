import { addNewTransaction } from '@/lib/functions';
import { TransactionFormData, TransactionFormSchema } from '@/lib/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Separator } from '@/components/ui/separator';
import { MdAdd } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import InputText from '@/components/generic/input-text';
import { ButtonLoading } from '@/components/generic/button-loading';
import { InputDate } from '@/components/generic/input-date';
import { format } from 'date-fns';

type AddExpenseDialogProps = {
  staffUid: string;
};

export default function AddExpenseDialog({ staffUid }: AddExpenseDialogProps) {
  const [open, setOpen] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(TransactionFormSchema),
  });

  const handleDialogChange = (state: boolean) => {
    setOpen(state);
    reset();
  };

  const onSubmit = async (data: TransactionFormData) => {
    addNewTransaction('staff', staffUid, 'bill', data.date, {
      title: data.title,
      details: data.details,
      value: data.value,
      date: format(new Date(data.date), 'dd.MM.yy'),
    }).finally(() => {
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button>
          <MdAdd /> Add
        </Button>
      </DialogTrigger>
      <DialogContent className={'border-2 border-blue-500'}>
        <DialogHeader>
          <DialogTitle>Add Expense Transaction</DialogTitle>
          <DialogDescription>
            Click submit to add the new payment transaction.
          </DialogDescription>
        </DialogHeader>
        <Separator
          orientation={'horizontal'}
          className="bg-card-foreground mt-2"
        />
        <form onSubmit={handleSubmit(onSubmit)} onReset={() => reset()}>
          <div>
            <InputText
              label="Title"
              {...register('title')}
              error={errors.title?.message ?? ''}
              required
            />
            <InputText
              label="Details"
              {...register('details')}
              error={errors.details?.message ?? ''}
            />
            <InputText
              type="number"
              label="Amount"
              min={0}
              step={0.01}
              {...register('value', { valueAsNumber: true })}
              pre="৳"
              error={errors.value?.message ?? ''}
              required
            />
            <InputDate
              label="Date"
              {...register('date')}
              error={errors.date?.message ?? ''}
              required
            />
          </div>

          <DialogFooter className={'sm:justify-center pt-8 gap-4'}>
            <DialogClose asChild>
              <Button type="button" variant="destructive">
                Close
              </Button>
            </DialogClose>
            <ButtonLoading
              type="submit"
              loading={isSubmitting}
              loadingText="Submitting..."
            >
              Submit
            </ButtonLoading>
            <Button type="reset" variant={'accent'}>
              Reset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
