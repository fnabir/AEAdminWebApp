import InputText from "@/components/generic/input-text";
import Separator from "@/components/generic/separator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateFileExpense } from "@/lib/functions";
import { expenseDataType } from "@/lib/types";
import { showToast } from "@/lib/utils";
import { DataSnapshot } from "firebase/database";
import { useEffect, useState } from "react";
import { MdAdd, MdEdit } from "react-icons/md";

interface ExpenseDialogProps {
  fileNo: number;
  fileYear: number;
  type: "port" | "custom" | "other" | "delivery";
  data: DataSnapshot[] | undefined;
  title: string;
}

const ExpenseDialog = ({
  fileNo,
  fileYear,
  type,
  data,
  title
}: ExpenseDialogProps) => {

  const [open, setOpen] = useState(false)
  const [dataSets, setDataSets] = useState<expenseDataType[]>([
      { id: 1, details: "", value: 0 },
    ]);

  const maxLength = type === "port" ? 8 : 3

  const addDataSet = () => {
    if (dataSets.length < maxLength) {
      setDataSets((prev: expenseDataType[]) => [...prev, { id: prev.length + 1, details: "", value: 0 }])
    } else {
      showToast("Limit", "Maximum number of expense reached!", "error")
    }
  };

  const handleDataChange = (id: number, field: "details" | "value", value: string | number) => {
    setDataSets((prev) => prev.map((set) =>set.id === id ? { ...set, [field]: value } : set))
  }

  const handleSubmit = () => {
    updateFileExpense(fileNo, fileYear, type, dataSets).finally(() => {
      setOpen(false)
    })
  }

  useEffect(() => {
    if (data && data.length > 0) {
      const loadedData = data.map((item, index) => {
        const snapshot = item.val();
        return {
          id: index + 1,
          details: snapshot.details || "",
          value: snapshot.value || 0
        };
      });
      setDataSets(loadedData);
    }
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MdEdit/> {title}
        </Button>
      </DialogTrigger>
      <DialogContent className={"border border-accent"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Click submit to update the expenses</DialogDescription>
        </DialogHeader>
        <Separator orientation={"horizontal"}/>
        <form className="flex-col text-center" onSubmit={() => handleSubmit()}>
          {
            dataSets.length < maxLength && (
              <Button type="button" variant="default" size="sm" onClick={() => addDataSet()}><MdAdd/> Add</Button>
            )
          }
          {
            dataSets.map((set, index) => (
              <div key={set.id} className="flex flex-row gap-x-2 items-baseline">
                <InputText label={`Port Expense ${index + 1}`}
                            className={`flex-[0.8]`}
                            defaultValue={dataSets[index].details}
                            onChange={(e) => {handleDataChange(set.id, "details", e.target.value)}}
                />
                <InputText label={`Amount ${index + 1}`}
                            type="number" pre={`৳`} className={`flex-[0.2]`}
                            defaultValue={dataSets[index].value}
                            onChange={(e) => handleDataChange(set.id, "value", Number(e.target.value))}
                />
              </div>
            ))
          }
          <DialogFooter className={"sm:justify-center pt-8 gap-4"}>
            <DialogClose asChild>
              <Button type="button" size="lg" variant="destructive">
                Close
              </Button>
            </DialogClose>
            <Button type="submit" size="lg">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ExpenseDialog;