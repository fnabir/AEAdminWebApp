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
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FileDutyFormData, FileDutyFormSchema } from '@/lib/schemas';
import { FileDutyData } from '@/lib/types';
import { setFileDuty } from '@/lib/functions';

interface DutyDialogProps {
  fileNo: number;
  fileYear: number;
  assesableValue: number;
  data: FileDutyData | undefined;
}

const dutyKeys = ['CD', 'RD', 'SD', 'VAT', 'AIT', 'AT'] as const;

const DutyDialog = ({
  fileNo,
  fileYear,
  assesableValue,
  data,
}: DutyDialogProps) => {
  const [open, setOpen] = useState(false);

  const defaultValues: FileDutyData = {
    CD: {
      percentage: data?.CD?.percentage ?? 0,
      value: data?.CD?.value ?? 0,
    },
    RD: {
      percentage: data?.RD?.percentage ?? 0,
      value: data?.RD?.value ?? 0,
    },
    SD: {
      percentage: data?.SD?.percentage ?? 0,
      value: data?.SD?.value ?? 0,
    },
    VAT: {
      percentage: data?.VAT?.percentage ?? 0,
      value: data?.VAT?.value ?? 0,
    },
    AIT: {
      percentage: data?.AIT?.percentage ?? 0,
      value: data?.AIT?.value ?? 0,
    },
    AT: {
      percentage: data?.AT?.percentage ?? 0,
      value: data?.AT?.value ?? 0,
    },
    DF: {
      value: data?.DF?.value ?? 0,
    },
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FileDutyFormData>({
    resolver: zodResolver(FileDutyFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open && data) {
      reset({
        CD: {
          percentage: data.CD?.percentage ?? 0,
          value: data.CD?.value ?? 0,
        },
        RD: {
          percentage: data.RD?.percentage ?? 0,
          value: data.RD?.value ?? 0,
        },
        SD: {
          percentage: data.SD?.percentage ?? 0,
          value: data.SD?.value ?? 0,
        },
        VAT: {
          percentage: data.VAT?.percentage ?? 0,
          value: data.VAT?.value ?? 0,
        },
        AIT: {
          percentage: data.AIT?.percentage ?? 0,
          value: data.AIT?.value ?? 0,
        },
        AT: {
          percentage: data.AT?.percentage ?? 0,
          value: data.AT?.value ?? 0,
        },
        DF: {
          value: data.DF?.value ?? 0,
        },
      });
    }
  }, [open, data, reset]);

  const handleDialogChange = (state: boolean) => {
    setOpen(state);
    reset();
  };

  const cdPercentage = watch('CD.percentage');
  const rdPercentage = watch('RD.percentage');
  const sdPercentage = watch('SD.percentage');
  const vatPercentage = watch('VAT.percentage');
  const aitPercentage = watch('AIT.percentage');
  const atPercentage = watch('AT.percentage');
  const cdValue = watch('CD.value') || 0;
  const rdValue = watch('RD.value') || 0;
  const sdValue = watch('SD.value') || 0;

  useEffect(() => {
    if (!cdPercentage || cdPercentage <= 0) {
      setValue('CD.value', 0, { shouldValidate: true });
      return;
    }

    const calculated = (cdPercentage / 100) * assesableValue;
    setValue('CD.value', Number(calculated.toFixed(2)), {
      shouldValidate: true,
    });
  }, [cdPercentage, assesableValue]);

  useEffect(() => {
    if (!rdPercentage || rdPercentage <= 0) {
      setValue('RD.value', 0, { shouldValidate: true });
      return;
    }

    const calculated = (rdPercentage / 100) * assesableValue;
    setValue('RD.value', Number(calculated.toFixed(2)), {
      shouldValidate: true,
    });
  }, [rdPercentage, assesableValue]);

  useEffect(() => {
    if (!sdPercentage || sdPercentage <= 0) {
      setValue('SD.value', 0, { shouldValidate: true });
      return;
    }

    const calculated =
      (sdPercentage / 100) * (assesableValue + cdValue + rdValue);
    setValue('SD.value', Number(calculated.toFixed(2)), {
      shouldValidate: true,
    });
  }, [sdPercentage, assesableValue, cdValue, rdValue]);

  useEffect(() => {
    if (!vatPercentage || vatPercentage <= 0) {
      setValue('VAT.value', 0, { shouldValidate: true });
      return;
    }

    const calculated =
      (vatPercentage / 100) * (assesableValue + cdValue + rdValue);
    setValue('VAT.value', Number(calculated.toFixed(2)), {
      shouldValidate: true,
    });
  }, [vatPercentage, assesableValue, cdValue, rdValue]);

  useEffect(() => {
    if (!aitPercentage || aitPercentage <= 0) {
      setValue('AIT.value', 0, { shouldValidate: true });
      return;
    }

    const calculated = (aitPercentage / 100) * assesableValue;
    setValue('AIT.value', Number(calculated.toFixed(2)), {
      shouldValidate: true,
    });
  }, [aitPercentage, assesableValue]);

  useEffect(() => {
    if (!atPercentage || atPercentage <= 0) {
      setValue('AT.value', 0, { shouldValidate: true });
      return;
    }

    const calculated =
      (atPercentage / 100) * (assesableValue + cdValue + rdValue + sdValue);
    setValue('AT.value', Number(calculated.toFixed(2)), {
      shouldValidate: true,
    });
  }, [atPercentage, assesableValue, cdValue, rdValue, sdValue]);

  const onSubmit = (form: FileDutyFormData) => {
    const result: any = {};

    dutyKeys.forEach((key) => {
      const field = form[key];

      if (field.percentage && field.percentage > 0) {
        result[key] = {
          percentage: field.percentage,
          value: field.value,
        };
      }

      if (form.DF?.value && form.DF?.value > 0) {
        result.DF = {
          value: Number(form.DF.value.toFixed(2)),
        };
      }
    });

    setFileDuty(fileNo, fileYear, result).finally(() => {
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button>Duty</Button>
      </DialogTrigger>
      <DialogContent className={'border border-accent'}>
        <DialogHeader>
          <DialogTitle>Duty Expenses</DialogTitle>
          <DialogDescription>
            Click submit to update the duty.
          </DialogDescription>
        </DialogHeader>
        <Separator orientation={'horizontal'} />
        <form
          className="flex-col text-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-row gap-x-2 items-baseline">
            <div className="w-16 text-left">CD</div>
            <InputText
              label="Percentage"
              type="number"
              {...register('CD.percentage', { valueAsNumber: true })}
              className={`flex-[0.3]`}
              step={0.1}
            />
            <InputText
              label="Amount"
              type="number"
              {...register('CD.value', { valueAsNumber: true })}
              pre={`৳`}
              className={`flex-[0.7]`}
              step={0.01}
            />
          </div>
          <div className="flex flex-row gap-x-2 items-baseline">
            <div className="w-16 text-left">RD</div>
            <InputText
              label="Percentage"
              type="number"
              {...register('RD.percentage', { valueAsNumber: true })}
              className={`flex-[0.3]`}
              step={0.1}
            />
            <InputText
              label="Amount"
              type="number"
              {...register('RD.value', { valueAsNumber: true })}
              pre={`৳`}
              className={`flex-[0.7]`}
              step={0.01}
            />
          </div>
          <div className="flex flex-row gap-x-2 items-baseline">
            <div className="w-16 text-left">SD</div>
            <InputText
              label="Percentage"
              type="number"
              {...register('SD.percentage', { valueAsNumber: true })}
              className={`flex-[0.3]`}
              step={0.1}
            />
            <InputText
              label="Amount"
              type="number"
              {...register('SD.value', { valueAsNumber: true })}
              pre={`৳`}
              className={`flex-[0.7]`}
              step={0.01}
            />
          </div>
          <div className="flex flex-row gap-x-2 items-baseline">
            <div className="w-16 text-left">VAT</div>
            <InputText
              label="Percentage"
              type="number"
              {...register('VAT.percentage', { valueAsNumber: true })}
              className={`flex-[0.3]`}
              step={0.1}
            />
            <InputText
              label="Amount"
              type="number"
              {...register('VAT.value', { valueAsNumber: true })}
              pre={`৳`}
              className={`flex-[0.7]`}
              step={0.01}
            />
          </div>
          <div className="flex flex-row gap-x-2 items-baseline">
            <div className="w-16 text-left">AIT</div>
            <InputText
              label="Percentage"
              type="number"
              {...register('AIT.percentage', { valueAsNumber: true })}
              className={`flex-[0.3]`}
              step={0.1}
            />
            <InputText
              label="Amount"
              type="number"
              {...register('AIT.value', { valueAsNumber: true })}
              pre={`৳`}
              className={`flex-[0.7]`}
              step={0.01}
            />
          </div>
          <div className="flex flex-row gap-x-2 items-baseline">
            <div className="w-16 text-left">AT</div>
            <InputText
              label="Percentage"
              type="number"
              {...register('AT.percentage', { valueAsNumber: true })}
              className={`flex-[0.3]`}
              step={0.1}
            />
            <InputText
              label="Amount"
              type="number"
              {...register('AT.value', { valueAsNumber: true })}
              pre={`৳`}
              className={`flex-[0.7]`}
              step={0.01}
            />
          </div>
          <div className="flex flex-row gap-x-2 items-baseline">
            <div className="w-16 text-left">DF/VAT</div>
            <InputText
              label="Amount"
              type="number"
              {...register('DF.value', { valueAsNumber: true })}
              pre={`৳`}
              className={`flex-1`}
              step={0.01}
            />
          </div>
          <DialogFooter className={'sm:justify-center pt-8 gap-4'}>
            <DialogClose asChild>
              <Button type="button" variant="destructive">
                Close
              </Button>
            </DialogClose>
            <Button type="submit">Submit</Button>
            <Button
              type="button"
              variant={'accent'}
              onClick={() => reset(defaultValues)}
            >
              Reset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DutyDialog;
