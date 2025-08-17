
import React from "react";
import { Button } from "../ui/button";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

export const InfoButton: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-20 right-5 z-10 rounded-full bg-white shadow-md hover:bg-gray-100"
        >
          <Info className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md h-[80vh]">
        <DialogHeader>
          <DialogTitle>Trip Summary</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Duration</h4>
            <p className="text-gray-700">March 15 - March 18, 2025 (4 days)</p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Budget</h4>
            <div className="flex justify-between items-center">
              <span>Accommodation:</span>
              <span className="font-medium">₹7,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Activities:</span>
              <span className="font-medium">₹5,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Food & Drinks:</span>
              <span className="font-medium">₹4,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Transportation:</span>
              <span className="font-medium">₹3,500</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className="font-semibold">Total:</span>
              <span className="font-bold">₹20,000</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Places to Visit</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Arambol Beach</li>
              <li>Calangute Beach</li>
              <li>Baga Beach</li>
              <li>Tito's Lane</li>
              <li>Anjuna Flea Market</li>
              <li>Chapora Fort</li>
              <li>Basilica of Bom Jesus</li>
              <li>Dudhsagar Falls</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Weather</h4>
            <p className="text-gray-700 mb-2">Average temperature: 30°C - 36°C</p>
            <p className="text-gray-700">Expect sunny days with occasional afternoon showers.</p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Useful Information</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Local currency: Indian Rupee (₹)</li>
              <li>Language: Konkani, Hindi, English</li>
              <li>Emergency number: 112</li>
              <li>Tourist Police: 1800-832-1234</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Packing Tips</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Lightweight clothing</li>
              <li>Sunscreen (SPF 50+)</li>
              <li>Insect repellent</li>
              <li>Swimwear</li>
              <li>Beach sandals</li>
              <li>Hat and sunglasses</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-2">Local Customs</h4>
            <p className="text-gray-700 mb-2">
              Goa has a relaxed atmosphere, but it's still important to respect local customs.
              Dress modestly when visiting religious sites and always ask before taking photos of locals.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};