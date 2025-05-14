import { useState } from "react";
import InputText from "@/components/generic/input-text";
import Separator from "@/components/generic/separator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MdEdit } from "react-icons/md";
import { updateFile } from "@/lib/functions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FilePaymentFormData, FilePaymentFormSchema } from "@/lib/schemas";
import InputTextarea from "@/components/generic/input-textarea";
import { FileDetailsType } from "@/lib/types";

interface PaidDialogProps {
  fileNo: number;
  fileYear: number;
  fileDetails: FileDetailsType;
}

const PaidDialog = ({
  fileNo,
  fileYear,
  fileDetails
}: PaidDialogProps) => {
  const [open, setOpen] = useState(false)

  const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<FilePaymentFormData>({
      resolver: zodResolver(FilePaymentFormSchema),
    });

  const onSubmit = async (data: FilePaymentFormData) => {
    updateFile(fileNo, fileYear, {}, data).finally(() => {
      setOpen(false);
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MdEdit/> File Payment Details
        </Button>
      </DialogTrigger>
      <DialogContent className={"border border-accent"}>
        <DialogHeader>
          <DialogTitle>Update File</DialogTitle>
          <DialogDescription>
            Click submit to update the file details.
          </DialogDescription>
        </DialogHeader>
        <Separator orientation={"horizontal"}/>
        <form className="flex-col" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex space-x-2">
            <InputText label={"Duty Paid Details"}
                        className={`flex-[0.7]`}
                        defaultValue={fileDetails?.dutyPaid}
                        {...register("dutyPaid")}
                        error={errors.dutyPaid ? errors.dutyPaid.message : ""}
            />
            <InputText type="number"
                      label="Total Duty"
                      defaultValue={fileDetails?.dutyValue ? fileDetails.dutyValue : 0}
                      {...register("dutyValue", {valueAsNumber: true})}
                      pre="৳"
                      error={errors.dutyValue ? errors.dutyValue.message : ""}
                      className="flex-[0.3]"
                      step={0.01}
            />
          </div>
          <InputText type="number"
                      label="Paid"
                      defaultValue={fileDetails?.paid ? fileDetails.paid : 0}
                      {...register("paid", {valueAsNumber: true})}
                      pre="৳"
                      error={errors?.paid?.message}
                      step={0.01}
          />
          <InputTextarea label="Remarks"
                          defaultValue={fileDetails?.remarks}
                          {...register("remarks")}
          />
          <DialogFooter className={"sm:justify-center pt-8 gap-4"}>
            <DialogClose asChild>
              <Button type="button" size="lg" variant="destructive">
                Close
              </Button>
            </DialogClose>
            <Button type="submit" size="lg">Submit</Button>
            <Button type="reset" size="lg" variant={"accent"}>Reset</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PaidDialog