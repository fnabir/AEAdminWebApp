import { updateRequisitionCharges } from '@/lib/functions';
import {
  RequisitionChargeFormData,
  RequisitionChargeFormSchema,
} from '@/lib/schemas';
import { generateFileCode } from '@/lib/utils';
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

type FileExpenseDialogProps = {
  ref: number;
  fileNo: number;
  year: number;
  item: string;
  lc: string;
  charges: RequisitionChargeFormData;
};

export default function FileExpenseDialog({
  ref,
  fileNo,
  year,
  item,
  lc,
  charges,
}: FileExpenseDialogProps) {
  const [open, setOpen] = useState<boolean>(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequisitionChargeFormData>({
    resolver: zodResolver(RequisitionChargeFormSchema),
    defaultValues: charges,
  });

  const handleDialogChange = (state: boolean) => {
    setOpen(state);
    reset(charges);
  };

  const onSubmit = async (data: RequisitionChargeFormData) => {
    try {
      await updateRequisitionCharges(year, ref, fileNo, data);
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button>
          <MdAdd /> {item}
        </Button>
      </DialogTrigger>
      <DialogContent className={'border-2 border-blue-500'}>
        <DialogHeader>
          <DialogTitle>{item}</DialogTitle>
          <DialogDescription>
            {generateFileCode(fileNo, year)}
            <br />
            LC No. {lc}
          </DialogDescription>
        </DialogHeader>
        <Separator
          orientation={'horizontal'}
          className="bg-card-foreground mt-2"
        />
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <InputText
            label="Port Charge"
            type="number"
            {...register('port', { valueAsNumber: true })}
            pre={`৳`}
            step={0.01}
            error={errors?.port?.message ?? ''}
          />
          <InputText
            label="NOC"
            type="number"
            {...register('noc', { valueAsNumber: true })}
            pre={`৳`}
            step={0.01}
            error={errors?.noc?.message ?? ''}
          />
          <InputText
            label="Examine for Lab Test"
            type="number"
            {...register('examine', { valueAsNumber: true })}
            pre={`৳`}
            step={0.01}
            error={errors?.examine?.message ?? ''}
          />
          <InputText
            label="Section Change"
            type="number"
            {...register('section', { valueAsNumber: true })}
            pre={`৳`}
            step={0.01}
          />
          <InputText
            label="Labour"
            type="number"
            {...register('labour', { valueAsNumber: true })}
            pre={`৳`}
            step={0.01}
            error={errors?.labour?.message ?? ''}
          />
          <InputText
            label="Truck"
            type="number"
            {...register('truck', { valueAsNumber: true })}
            pre={`৳`}
            step={0.01}
            error={errors?.truck?.message ?? ''}
          />
          <InputText
            label="Assessment/Delivery"
            type="number"
            {...register('assessment', { valueAsNumber: true })}
            pre={`৳`}
            step={0.01}
            error={errors?.assessment?.message ?? ''}
          />
          <DialogFooter
            className={'col-span-1 sm:col-span-2 sm:justify-center pt-8 gap-4'}
          >
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
