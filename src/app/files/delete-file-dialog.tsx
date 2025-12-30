import { generateFileCode } from '@/lib/utils';
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
import { MdDelete } from 'react-icons/md';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { deleteFile } from '@/lib/functions';
import { ButtonLoading } from '@/components/generic/button-loading';

export default function DeleteFileDialog({
  year,
  fileNo,
}: {
  year: number;
  fileNo: number;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteFile(fileNo, year).finally(() => {
      setLoading(false);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-0 bg-transparent border-none">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <MdDelete className="size-8 p-1 border border-card-foreground text-card-foreground rounded-md cursor-pointer hover:bg-card-foreground/20" />
              </TooltipTrigger>
              <TooltipContent>Delete File</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </button>
      </DialogTrigger>

      <DialogContent className="border-2 border-red-500">
        <DialogHeader>
          <DialogTitle>Delete File</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the file.
          </DialogDescription>
        </DialogHeader>

        <div className="mx-auto p-1 font-semibold border-2 border-red-500 rounded-lg my-6">
          {generateFileCode(fileNo, year)}
        </div>

        <DialogFooter className="mx-auto">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>

          <ButtonLoading
            size="default"
            variant="destructive"
            loading={loading}
            loadingText="Deleting..."
            onClick={handleDelete}
          >
            Delete
          </ButtonLoading>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
