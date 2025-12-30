import { useState } from 'react';
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
import { MdChangeCircle, MdSwapHoriz } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import InputText from '@/components/generic/input-text';
import { DataSnapshot } from 'firebase/database';
import { ButtonLoading } from '@/components/generic/button-loading';
import { getDatabaseReferenceExists, showToast } from '@/lib/utils';
import { addNewFile, changeRequisitionRef } from '@/lib/functions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type AddFileDialogProps = {
  year: number;
  ref?: string;
};

export default function ChangeRefDialog({ year, ref }: AddFileDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newRef, setNewRef] = useState<string | undefined>();

  const handleDialogChange = (state: boolean) => {
    setOpen(state);
    setNewRef(undefined);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubmitting(true);
    if (ref === undefined) {
      showToast('Failed to find the current reference.');
      setIsSubmitting(false);
      return;
    }

    if (newRef === undefined) {
      showToast('Please enter the new reference.');
      setIsSubmitting(false);
      return;
    }

    if (await getDatabaseReferenceExists(`requisition/${year}/${newRef}`)) {
      showToast('Error', 'New Refrence already exists!', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      await changeRequisitionRef(year, ref, newRef);
      setOpen(false);
    } catch (error) {
      console.error(error);
      showToast('Error', 'Failed to update reference!', 'error');
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <MdChangeCircle
                className={`size-8 p-1 border border-card-foreground text-card-foreground rounded-md cursor-pointer hover:bg-card-foreground/20`}
              />
            </TooltipTrigger>
            <TooltipContent>Change Reference</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent className={'border-2 border-blue-500'}>
        <DialogHeader>
          <DialogTitle>Change P/O Requisition Reference</DialogTitle>
          <DialogDescription>
            Click submit to update the reference
          </DialogDescription>
        </DialogHeader>
        <Separator
          orientation={'horizontal'}
          className="bg-card-foreground mt-2"
        />
        <form onSubmit={onSubmit}>
          <div className="flex space-x-2 items-baseline">
            <p>AE/POR/</p>
            <InputText
              label="Reference"
              onChange={(e) => setNewRef(e.target.value)}
              className="flex-1"
              required
            />
            <p>/{year}</p>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
