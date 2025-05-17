import { ReactNode, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { MdDelete } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { deleteTransaction } from "@/lib/functions";

type DeleteTransactionDialogProps = {
  type: string;
  id: string;
  transactionType: string;
  transactionId: string;
  children?: ReactNode;
};

export default function DeleteTransactionDialog({ type, id, transactionType, transactionId, children }: DeleteTransactionDialogProps) {

  const [open, setOpen] = useState<boolean>(false);

  const handleDelete = async () => {
    deleteTransaction(type, id, transactionType, transactionId).finally(() => {
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon"><MdDelete className="size-6"/></Button>
      </DialogTrigger>
      <DialogContent className={"border-2 border-blue-500"}>
        <DialogHeader>
          <DialogTitle>Delete Transaction</DialogTitle>
          <DialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
          </DialogDescription>
        </DialogHeader>
        <Separator orientation="horizontal"/>
        {children}
				<DialogFooter className={"mx-auto"}>
          <DialogClose asChild>
              <Button type="button" variant="secondary">
                  Close
              </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
      </DialogFooter>
        
      </DialogContent>
    </Dialog>
  )
}