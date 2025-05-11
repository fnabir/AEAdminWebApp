import { addNewFile, getNextFileNo } from "@/lib/functions";
import { FileInfoFormData, FileInfoFormSchema } from "@/lib/schemas";
import { generateFileCode, getDatabaseReference, showToast } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useListKeys } from "react-firebase-hooks/database";
import { useForm } from "react-hook-form";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { MdAdd } from "react-icons/md";
import { Button } from "@/components/ui/button";
import InputText from "@/components/generic/input-text";
import InputDropDown from "@/components/generic/input-dropdown";
import { DataSnapshot } from "firebase/database";
import { fileStatusOptions } from "@/lib/arrays";
import { ButtonLoading } from "@/components/generic/button-loading";

type AddFileDialogProps = {
  year: number;
  filesData: DataSnapshot[] | undefined;
};

export default function AddFileDialog({ year, filesData }: AddFileDialogProps) {

  const [open, setOpen] = useState<boolean>(false);
  const [submit, setSubmit] = useState<boolean>(false);
  const [newFile, setNewFile] = useState<boolean>(false);
  const [newFileNo, setNewFileNo] = useState<number | undefined>();
  const suggestedFileNo = getNextFileNo(filesData)
  const importerNames = useListKeys(getDatabaseReference(`info/importer`))[0];
  const importerNameOptions = importerNames?.map((importerName) => ({ value: importerName}));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FileInfoFormData>({
    resolver: zodResolver(FileInfoFormSchema),
  });

  const handleDialogChange = (state: boolean) => {
    setOpen(state);
    setNewFile(false);
    setNewFileNo(undefined);
    reset();
  };

  const handleCheckNewFile = () => {
    setSubmit(true);
    if (!newFileNo) {
      showToast("Error", "Input New File No", "error");
      setNewFile(false);
      setSubmit(false);
      return;
    }
    if (filesData && filesData.some(snapshot => Number(snapshot.key) === newFileNo)) {
      showToast("Error", `File No ${newFileNo}/${year} already exists`, "error");
      setNewFile(false);
    } else {
      setNewFile(true);
      reset();
    }
    setSubmit(false);
  };

  const onSubmit = async (data: FileInfoFormData) => {
    if (!newFileNo) return;
    await addNewFile(newFileNo, year, data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button>
          <MdAdd/> Add New File
        </Button>
      </DialogTrigger>
      <DialogContent className={"border-2 border-blue-500"}>
        <DialogHeader>
          <DialogTitle>{ (newFile && newFileNo) ? generateFileCode(newFileNo, year) : "Add New File"}</DialogTitle>
          <DialogDescription>
            Click submit to add the new file
          </DialogDescription>
        </DialogHeader>
				<Separator orientation={"horizontal"} className="bg-card-foreground mt-2"/>
        <form onSubmit={handleSubmit(onSubmit)} onReset={() => {setNewFile(false);setNewFileNo(undefined);reset();}}>
          {!newFile ?
            <div className="flex items-baseline space-x-2">
              <InputText label="New File No"
                        onChange={(e) => setNewFileNo(Number(e.target.value))}
                        className="grow"
              />
              <Button className="-translate-y-0.25" variant="secondary" onClick={() => {setNewFileNo(suggestedFileNo);setNewFile(true);}}>
                {`Suggestion : ${generateFileCode(suggestedFileNo, year)}`}
              </Button>
            </div>
            :
            <div>
              <InputDropDown label="Importer"
                            options={importerNameOptions ?? []}
                            {...register('importer')}
                            error={errors.importer?.message || ""}
                            required
              />
              <InputText label="Package Details"
                        {...register("itemPackage")}
                        error={errors.itemPackage?.message || ""}
                        required
              />
              <InputText label="Item Name"
                        {...register("itemName")}
                        error={errors.itemName?.message || ""}
                        required
              />
              <div className="flex space-x-2">
                <InputText label="B/L No"
                        {...register("bl")}
                        error={errors.bl?.message || ""}
                        className="flex-[1]"
                />
                <InputText type="number"
                          label="LC No"
                          defaultValue={0}
                          {...register("lc", {valueAsNumber: true})}
                          error={errors.lc?.message || ""}
                          className="flex-[1]"
                />
              </div>
              <div className="flex space-x-2">
                <InputText type="number"
                          label="B/E No"
                          defaultValue={0}
                          {...register("be", {valueAsNumber: true})}
                          error={errors.be?.message || ""}
                          pre="C"
                          className="flex-[1]"
                />
                <InputDropDown label="Status"
                            options={fileStatusOptions}
                            {...register('status')}
                            className="flex-[1]"
                />
              </div>
            </div>
          }

          <DialogFooter className={"sm:justify-center pt-8 gap-4"}>
            <DialogClose asChild>
              <Button type="button" variant="destructive">
                Close
              </Button>
            </DialogClose>
            {!newFile && <Button type="button" onClick={handleCheckNewFile}>Check</Button>}
            {newFile && (
              <ButtonLoading
              type="submit"
              loading = {isSubmitting}
              text = "Submit"
              loadingText="Submitting..."
            />
            )}
            {newFile && <Button type="reset" variant={"accent"}>Reset</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}