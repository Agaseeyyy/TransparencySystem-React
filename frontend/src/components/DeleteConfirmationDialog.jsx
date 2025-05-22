import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

/**
 * A reusable delete confirmation dialog component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onOpenChange - Handler for dialog open state changes
 * @param {Function} props.onConfirm - Handler called when deletion is confirmed
 * @param {string} props.title - Dialog title (default: "Delete Item")
 * @param {string} props.description - Description text (default: general confirmation)
 * @param {string} props.entityName - Name of the entity being deleted
 * @param {string} props.entityId - ID of the entity being deleted
 * @param {string} props.confirmButtonText - Text for confirm button (default: "Delete")
 * @param {string} props.cancelButtonText - Text for cancel button (default: "Cancel")
 * @param {boolean} props.loading - Whether the deletion is in progress
 */
const DeleteConfirmationDialog = ({ 
    open, 
    onOpenChange, 
    onConfirm, 
    title = "Delete Item", 
    description = "Are you sure you want to delete this item? This action cannot be undone.", 
    entityName, 
    entityId,
    confirmButtonText = "Delete",
    cancelButtonText = "Cancel",
    loading = false
}) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white border shadow-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold text-rose-600 flex items-center">
                        <Trash2 className="w-5 h-5 mr-2" />
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                        {description || 'Are you sure you want to delete '}
                        {description ? '' : (
                            <>
                                <span className="font-medium text-gray-900">
                                    {entityName} {entityId ? `(${entityId})` : ''}
                                </span>
                                ? This action cannot be undone.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex justify-end gap-2 mt-6">
                    <AlertDialogCancel 
                        className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                        disabled={loading}
                    >
                        {cancelButtonText}
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={onConfirm}
                        className="bg-rose-600 hover:bg-rose-600/90 text-white cursor-pointer"
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : confirmButtonText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteConfirmationDialog; 