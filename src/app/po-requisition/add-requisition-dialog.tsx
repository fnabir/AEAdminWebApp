import { addNewRequisition } from '@/lib/functions';
import { RequisitionFormData, RequisitionFormSchema } from '@/lib/schemas';
import {
  generateFileCode,
  getDatabaseReference,
  getDatabaseReferenceExists,
  showToast,
} from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useList } from 'react-firebase-hooks/database';
import {
  Controller,
  FieldArrayPath,
  useFieldArray,
  useForm,
} from 'react-hook-form';
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
import { MdAdd, MdDelete } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import InputText from '@/components/generic/input-text';
import InputDropDown from '@/components/generic/input-dropdown';
import { ButtonLoading } from '@/components/generic/button-loading';
import { options } from '@/lib/types';
import { InputDate } from '@/components/generic/input-date';

export default function AddRequisitionDialog({ year }: { year: number }) {
  const [open, setOpen] = useState<boolean>(false);
  const filesList: options[] =
    useList(getDatabaseReference(`files/info/${year}`))[0]
      ?.filter((file) => {
        const importer = file.val()?.importer;
        return (
          typeof importer === 'string' &&
          importer.toLowerCase().includes('bio-pharma ltd')
        );
      })
      .map((file) => ({
        label: generateFileCode(Number(file.key), year),
        value: file.key as string,
      })) ?? [];

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RequisitionFormData>({
    resolver: zodResolver(RequisitionFormSchema),
    defaultValues: {
      ref: undefined,
      files: [''],
    },
  });

  const { fields, append, remove } = useFieldArray<RequisitionFormData>({
    name: 'files' as FieldArrayPath<RequisitionFormData>,
    control,
  });

  const selectedFiles = watch('files');
  const getAvailableOptions = (index: number) => {
    const used = selectedFiles.filter((_, i) => i !== index);

    return filesList.filter((opt) => !used.includes(opt.value));
  };

  const handleDialogChange = (state: boolean) => {
    setOpen(state);
    reset();
  };

  const onSubmit = async (data: RequisitionFormData) => {
    if (await getDatabaseReferenceExists(`requisition/${year}/${data.ref}`)) {
      showToast('Error', 'Reference already exists!', 'error');
      return;
    }

    try {
      await addNewRequisition(year, data);
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
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
          <DialogTitle>Add New P/O Requisition</DialogTitle>
          <DialogDescription>
            Click submit to generate the new requisition letter
          </DialogDescription>
        </DialogHeader>
        <Separator
          orientation={'horizontal'}
          className="bg-card-foreground mt-2"
        />
        <form
          onSubmit={handleSubmit(onSubmit)}
          onReset={() =>
            reset({
              ref: undefined,
              files: [''],
            })
          }
          className="flex flex-col space-y-2"
        >
          <div className="flex space-x-2 items-baseline">
            <p>AE/POR/</p>
            <InputText
              label="Reference"
              type="number"
              {...register('ref', { valueAsNumber: true })}
              error={errors.ref?.message || ''}
              className="flex-1"
              required
            />
            <p>/{year}</p>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="mb-3 flex space-x-2">
              <Controller
                control={control}
                name={`files.${index}`}
                render={({ field }) => (
                  <InputDropDown
                    label={`File No ${index + 1}`}
                    options={getAvailableOptions(index)}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={errors.files?.[index]?.message}
                    required
                    className="flex-1"
                  />
                )}
              />

              {index === fields.length - 1 &&
                fields.length < 4 &&
                selectedFiles[index] && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-4"
                    onClick={() => append('')}
                  >
                    <MdAdd />
                  </Button>
                )}

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  className="mt-4"
                  onClick={() => remove(index)}
                >
                  <MdDelete />
                </Button>
              )}
            </div>
          ))}

          <div className="flex space-x-2">
            <InputDate
              label="Letter Date"
              type="date"
              {...register('letterDate')}
              className="flex-1"
            />
            <InputDate
              label="Arrival Date"
              type="date"
              {...register('arrival')}
              className="flex-1"
            />
            <InputDate
              label="Delivery Date"
              type="date"
              {...register('delivery')}
              className="flex-1"
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
