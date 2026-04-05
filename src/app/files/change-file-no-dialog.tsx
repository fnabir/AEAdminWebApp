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
import { MdSwapHoriz } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import InputText from '@/components/generic/input-text';
import { DataSnapshot } from 'firebase/database';
import { ButtonLoading } from '@/components/generic/button-loading';
import { showToast } from '@/lib/utils';
import { addNewFile, swapFile } from '@/lib/functions';

type AddFileDialogProps = {
  year: number;
  filesData: DataSnapshot[] | undefined;
};

export default function ChangeFileNoDialog({
  year,
  filesData,
}: AddFileDialogProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [fileNo1, setFileNo1] = useState<number | undefined>();
  const [fileNo2, setFileNo2] = useState<number | undefined>();

  const handleDialogChange = (state: boolean) => {
    setOpen(state);
    setFileNo1(undefined);
    setFileNo2(undefined);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubmitting(true);
    if (fileNo1 === undefined || fileNo2 === undefined) {
      showToast('Please enter both file numbers.');
      setIsSubmitting(false);
      return;
    }

    const fileRef1 = filesData?.find((file) => Number(file.key) === fileNo1);
    const fileRef2 = filesData?.find((file) => Number(file.key) === fileNo2);

    if (!fileRef1 || !fileRef2) {
      showToast('One or both file numbers do not exist.', 'Error', 'error');
      setIsSubmitting(false);
      return;
    }

    const fileObj1 = fileRef1.val();
    const fileObj2 = fileRef2.val();

    swapFile([fileNo1, fileNo2], year, [fileObj1, fileObj2]);

    setIsSubmitting(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button>
          <MdSwapHoriz /> Change File No
        </Button>
      </DialogTrigger>
      <DialogContent className={'border-2 border-blue-500'}>
        <DialogHeader>
          <DialogTitle>Change File No</DialogTitle>
          <DialogDescription>
            Click submit to update the File No
          </DialogDescription>
        </DialogHeader>
        <Separator
          orientation={'horizontal'}
          className="bg-card-foreground mt-2"
        />
        <form onSubmit={onSubmit}>
          <div className="flex items-baseline space-x-2">
            <InputText
              label="File 1"
              onChange={(e) => setFileNo1(Number(e.target.value))}
              className="grow"
            />
            <InputText
              label="File 2"
              onChange={(e) => setFileNo2(Number(e.target.value))}
              className="grow"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
