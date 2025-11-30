import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { ChangePasswordFormData, ChangePasswordSchema } from '@/lib/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import InputPassword from '@/components/generic/input-password';
import { useChangePassword } from '@/hooks/use-change-password';
import { ButtonLoading } from '@/components/generic/button-loading';

export default function ChangePassword() {
  const [open, setOpen] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  const { changePassword, loading } = useChangePassword();

  const onSubmit = async (data: ChangePasswordFormData) => {
    const success = await changePassword(data);
    if (success) {
      setOpen(false);
      reset();
    }
  };

  return (
    <div>
      <Drawer
        open={open}
        onOpenChange={(state) => {
          setOpen(state);
          reset();
          if (!state && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }}
      >
        <DrawerTrigger asChild>
          <Button
            variant="accent"
            className="w-full max-w-sm flex mt-3 mx-auto"
          >
            Change Password
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm px-2">
            <DrawerHeader>
              <DrawerTitle className={'text-center'}>
                Change Password
              </DrawerTitle>
              <DrawerDescription className={'text-center'}>
                Enter your current and new password to update your account
                credentials.
              </DrawerDescription>
            </DrawerHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <InputPassword
                label="Current Password"
                {...register('currentPassword')}
                error={errors.currentPassword?.message || ''}
                disabled={loading}
                required
              />
              <InputPassword
                label="New Password"
                {...register('newPassword')}
                error={errors.newPassword?.message || ''}
                disabled={loading}
                required
              />
              <InputPassword
                label="Confirm New Password"
                {...register('confirmNewPassword')}
                error={errors.confirmNewPassword?.message || ''}
                disabled={loading}
                required
              />
              <DrawerFooter>
                <ButtonLoading
                  type="submit"
                  loading={loading}
                  loadingText="Updating..."
                >
                  Update Password
                </ButtonLoading>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
