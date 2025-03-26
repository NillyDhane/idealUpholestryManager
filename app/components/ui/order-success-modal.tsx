import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { UpholsteryOrder } from "@/app/lib/supabase";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { OrderPDF } from "../PDFGenerator";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: UpholsteryOrder;
}

export function OrderSuccessModal({
  isOpen,
  onClose,
  order,
}: OrderSuccessModalProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(order.layout_image_url);
      const pdfBlob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `order-${order.van_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <DialogTitle>Order Submitted Successfully</DialogTitle>
          </div>
          <DialogDescription>
            You can download the PDF or close this window.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="font-medium">Van Number:</div>
              <div>LTRV - {order?.van_number}</div>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="font-medium">Model:</div>
              <div>{order?.model}</div>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="font-medium">Brand of Sample:</div>
              <div>{order?.brand_of_sample || "N/A"}</div>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="font-medium">Color of Sample:</div>
              <div>{order?.color_of_sample || "N/A"}</div>
            </div>
          </div>

          {order?.layout_image_url && (
            <div className="mt-4">
              <div className="font-medium mb-2">Layout:</div>
              <div className="relative h-[200px] w-full bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src={order.layout_image_url}
                  alt="Layout"
                  fill
                  className="object-contain"
                />
              </div>
              {order?.layout_name && (
                <div className="mt-2 text-sm text-gray-600">
                  {order.layout_name.replace(/\.[^/.]+$/, "")}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <PDFDownloadLink
            document={<OrderPDF order={order} />}
            fileName={`upholstery-order-${order.van_number}.pdf`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {({ blob, url, loading, error }) => {
              if (loading) return 'Generating PDF...';
              if (error) return 'Error generating PDF';
              return 'Download PDF';
            }}
          </PDFDownloadLink>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 