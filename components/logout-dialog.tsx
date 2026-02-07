import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Loader2, LogOut } from "lucide-react";
import { LogoutDialogProps } from "@/types";

export default function LogoutDialog({
  handleLogout,
  isLoading,
}: LogoutDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="mr-4" asChild>
          {isLoading ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : (
            <LogOut className="text-gray-500" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ログアウトしますか？</AlertDialogTitle>
          {/* <AlertDialogDescription>
            ログアウトすると、現在のセッションは終了します。
          </AlertDialogDescription> */}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>
            ログアウト
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
