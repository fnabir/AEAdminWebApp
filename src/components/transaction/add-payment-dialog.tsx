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
import InputDropDown from '@/components/generic/input-dropdown';
import { paymentOptions } from '@/lib/arrays';
import { ButtonLoading } from '@/components/generic/button-loading';
import { InputDate } from '@/components/generic/input-date';
import { format } from 'date-fns';

type AddPaymentDialogProps = {
  type: string;
  id: string;
};

export default function AddPaymentDialog({ type, id }: AddPaymentDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [detailsLabel, setDetailsLabel] = useState<string>('Details');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(TransactionFormSchema),
  });

  const handleDialogChange = (state: boolean) => {
    setOpen(state);
    reset();
  };

  const handleTitleChange = (label: string) => {
    switch (label) {
      case 'Cash':
        setDetailsLabel('Receiver');
        setValue('details', '');
        break;
      case 'Cheque':
      case 'Bank Transfer':
        setDetailsLabel('Bank Name, Branch');
        setValue('details', '');
        break;
      case 'Account Transfer':
      case 'CellFin (Account)':
        setDetailsLabel('Account Number');
        setValue('details', 'Acc No.**');
        break;
      case 'CellFin (Phone)':
        setDetailsLabel('Phone Number');
        setValue('details', '');
        break;
      case 'bKash':
        setDetailsLabel('bKash Number');
        setValue('details', '');
        break;
      default:
        setDetailsLabel('Details');
        setValue('details', '');
        break;
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    addNewTransaction(type, id, 'payment', data.date, {
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
          <DialogTitle>Add Payment Transaction</DialogTitle>
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
            <InputDropDown
              label="Payment Type"
              options={paymentOptions}
              {...register('title')}
              onChange={(e) =>
                handleTitleChange(e.target.options[e.target.selectedIndex].text)
              }
              error={errors.title?.message ?? ''}
              required
            />
            <InputText
              label={detailsLabel}
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
