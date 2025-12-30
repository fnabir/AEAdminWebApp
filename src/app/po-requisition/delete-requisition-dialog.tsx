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
import { deleteRequisition } from '@/lib/functions';
import { ButtonLoading } from '@/components/generic/button-loading';

export default function DeleteRequisitionDialog({
  year,
  ref,
}: {
  year: number;
  ref: string;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteRequisition(year, ref);
      setOpen(false);
    } catch (err) {
      console.error('Failed to delete requisition:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <MdDelete className="size-8 p-1 border border-card-foreground text-card-foreground rounded-md cursor-pointer hover:bg-card-foreground/20" />
            </TooltipTrigger>
            <TooltipContent>Delete Requisition Letter</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>

      <DialogContent className="border-2 border-red-500">
        <DialogHeader>
          <DialogTitle>Delete Requisition Letter</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            letter.
          </DialogDescription>
        </DialogHeader>

        <div className="mx-auto p-1 font-semibold border-2 border-red-500 rounded-lg my-6">
          AE/POR/{ref}/{year}
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
