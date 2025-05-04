import { DataSnapshot } from "firebase/database";
import { useEffect, useState } from "react";
import InputText from "@/components/generic/input-text";
import Separator from "@/components/generic/separator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MdEdit } from "react-icons/md";
import { updateFile } from "@/lib/functions";
import { format, parse } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FileDetailsFormData, FileDetailsFormSchema } from "@/lib/schemas";
import { useListKeys } from "react-firebase-hooks/database";
import { getDatabaseReference } from "@/lib/utils";
import InputDropDown from "@/components/generic/input-dropdown";
import { InputDate } from "@/components/generic/input-date";
import { fileStatusOptions } from "@/lib/arrays";

interface DetailsDialogProps {
  fileNo: number;
  fileYear: number;
  fileInfoData: DataSnapshot | undefined;
  fileDetailsData: DataSnapshot | undefined;
}

const DetailsDialog = ({
  fileNo,
  fileYear,
  fileInfoData,
  fileDetailsData
}: DetailsDialogProps) => {
  const [open, setOpen] = useState(false)

  const importerNames = useListKeys(getDatabaseReference(`info/importer`))[0];
  const importerNameOptions = importerNames?.map((importerName) => ({ value: importerName}))
  const fileInfo = fileInfoData?.val()
  const fileDetails = fileDetailsData?.val()

  const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
    } = useForm<FileDetailsFormData>({
      resolver: zodResolver(FileDetailsFormSchema),
    });

  const onSubmit = async (data: FileDetailsFormData) => {
    const dataInfo = {
      importer: data.importer,
      itemCount : data.itemCount,
      itemPackage : data.itemPackage,
      itemName : data.itemName,
      lc: data.lc,
      be: data.be,
      bl: data.bl,
      status: data.status
    }
    const dataDetails = {
      vessel: data.vessel,
      rotNo: data.rotNo,
      cnfValue: data.cnfValue,
      assessableValue: data.assessableValue,
      beDate: data.beDate ? format(new Date(data.beDate), "dd.MM.yyyy") : null,
      assessmentDate: data.assessmentDate ? format(new Date(data.assessmentDate), "dd.MM.yy") : null,
      dutyPaymentDate: data.dutyPaymentDate ? format(new Date(data.dutyPaymentDate), "dd.MM.yy") : null,
      deliveryDate: data.deliveryDate ? format(new Date(data.deliveryDate), "dd.MM.yy") : null,
      dutyRef: data.dutyRef,
      assessmentRef: data.assessmentRef
    }
    updateFile(fileNo, fileYear, dataInfo, dataDetails).finally(() => {
      setOpen(false);
    })
  }

  useEffect(() => {
    if (fileDetails) {
      setValue("beDate", fileDetails.beDate ? format(parse(fileDetails.beDate, "dd.MM.yyyy", new Date()), "yyyy-MM-dd") : "");
      setValue("assessmentDate", fileDetails.assessmentDate ? format(parse(fileDetails.assessmentDate, "dd.MM.yy", new Date()), "yyyy-MM-dd") : "");
      setValue("dutyPaymentDate", fileDetails.dutyPaymentDate ? format(parse(fileDetails.dutyPaymentDate, "dd.MM.yy", new Date()), "yyyy-MM-dd") : "");
      setValue("deliveryDate", fileDetails.deliveryDate ? format(parse(fileDetails.deliveryDate, "dd.MM.yy", new Date()), "yyyy-MM-dd") : "");
    }
  }, [fileDetails, setValue]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MdEdit/> File Details
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
            <InputDropDown id="importer"
                          label="Importer"
                          options={importerNameOptions ? importerNameOptions : []}
                          defaultValue={fileInfo?.importer}
                          {...register('importer')}
                          helperText={errors.importer ? errors.importer.message : ""}
                          color={errors.importer ? "error" : "default"}
                          className="flex-[0.7]"
                          required
            />
            <InputText id="itemCount"
                        type="number"
                        label="Item Count"
                        defaultValue={fileInfo?.itemCount}
                        {...register("itemCount")}
                        className="flex-[0.3]"
                        required
              />
          </div>
          <InputText id="itemPackage"
                      type="text"
                      label="Package Details"
                      defaultValue={fileInfo.itemPackage}
                      {...register("itemPackage")}
                      error={errors?.itemPackage?.message}
                      required
          />
          <InputText id="itemName"
                      type="text"
                      label="Item Name"
                      defaultValue={fileInfo.itemName}
                      {...register("itemName")}
                      error={errors?.itemName?.message}
                      required
          />
          <div className="flex space-x-2">
            <InputText id="lc"
                        type="number"
                        label="LC No"
                        defaultValue={fileInfo?.lc ? fileInfo.lc : 0}
                        {...register("lc", {valueAsNumber: true})}
                        className="flex-[0.5]"
            />
            <InputText id="bl"
                      type="text"
                      label="B/L No"
                      defaultValue={fileInfo?.bl}
                      {...register("bl")}
                      className="flex-[0.5]"
            />
          </div>
          <div className="flex space-x-2">
            <InputText id="vessel"
                      type="text"
                      label="Vessel Name"
                      defaultValue={fileDetails?.vessel}
                      {...register("vessel")}
                      className="flex-[0.55]"
            />
            <InputText id="rotNo"
                      type="text"
                      label="Rot No"
                      defaultValue={fileDetails?.rotNo}
                      {...register("rotNo")}
                      className="flex-[0.45]"
            />
          </div>
          <div className="flex space-x-2">
          <InputText type="number"
                    label="C&F Value"
                    defaultValue={fileDetails?.cnfValue ? fileDetails.cnfValue : 0}
                    {...register("cnfValue", {valueAsNumber: true})}
                    pre="$"
                    error={errors?.cnfValue?.message}
                    className="flex-[1]"
                    step={0.01}
            />
            <InputText type="number"
                      label="Assessable Value"
                      defaultValue={fileDetails?.assessableValue ? fileDetails.assessableValue : 0}
                      {...register("assessableValue", {valueAsNumber: true})}
                      pre="৳"
                      error={errors?.assessableValue?.message}
                      className="flex-[1]"
                      step={0.01}
            />
          </div>
          <div className="flex space-x-2">
            <InputText id="be"
                      type="number"
                      label="B/E No"
                      defaultValue={fileInfo?.be}
                      {...register("be", {valueAsNumber: true})}
                      pre="C"
                      className="flex-[1]"
            />
            <InputDate
              label="B/E Date"
              type="date"
              {...register("beDate")}
              className="flex-[1]"
            />
          </div>
          <div className="flex space-x-2">
            <InputDate
              label="Assessment Date"
              type="date"
              {...register("assessmentDate")}
              className="flex-[1]"
            />
            <InputDate
              label="Duty Payment Date"
              type="date"
              {...register("dutyPaymentDate")}
              className="flex-[1]"
            />
            <InputDate
              label="Delivery Date"
              type="date"
              {...register("deliveryDate")}
              className="flex-[1]"
            />
          </div>
          <div className="flex space-x-2">
            <InputText type="number"
                      label="Release Order No"
                      defaultValue={fileDetails?.dutyRef ? fileDetails.dutyRef : 0}
                      {...register("dutyRef", {valueAsNumber: true})}
                      pre="R"
                      className="flex-[1]"
            />
            <InputText type="number"
                      label="Assessment Reference"
                      defaultValue={fileDetails?.assessmentRef ? fileDetails.assessmentRef : 0}
                      {...register("assessmentRef", {valueAsNumber: true})}
                      pre="A"
                      className="flex-[1]"
            />  
          </div>
          <InputDropDown id="status"
                          label="Status"
                          options={fileStatusOptions}
                          defaultValue={fileInfo?.status}
                          {...register('status')}
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

export default DetailsDialog