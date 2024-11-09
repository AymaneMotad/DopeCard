"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Star,
  Smartphone,
  MessageCircle,
  Apple,
  QrCode,
  Check,
} from "lucide-react";

export function LoyaltyPassGenerator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    expiration: "unlimited",
    startDate: "",
    endDate: "",
    stampCount: 5,
    initialStamps: 0,
    backgroundColor: "#000000",
    textColor: "#ffffff",
    stampImage: null,
    unlockedStampImage: null,
    logo: null,
    cardTitle: "Stamp card №1",
    subtitle: "Member",
  });
  const [previewDevice, setPreviewDevice] = useState("iphone");

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | undefined) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          [field]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const steps = [
    {
      title: "Settings",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-semibold mb-2">
              Card Expiration
            </Label>
            <RadioGroup
              value={formData.expiration}
              onValueChange={(value) => handleInputChange("expiration", value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unlimited" id="unlimited" />
                <Label htmlFor="unlimited" className="font-medium">
                  Unlimited
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="timeRange" id="timeRange" />
                <Label htmlFor="timeRange" className="font-medium">
                  Time Range
                </Label>
              </div>
            </RadioGroup>
          </div>
          {formData.expiration === "timeRange" && (
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="startDate" className="font-medium">
                  Start Date
                </Label>
                <Input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endDate" className="font-medium">
                  End Date
                </Label>
                <Input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <div>
            <Label className="text-lg font-semibold mb-2">
              Count of Stamps
            </Label>
            <Slider
              min={5}
              max={10}
              step={1}
              value={[formData.stampCount]}
              onValueChange={(value) =>
                handleInputChange("stampCount", value[0])
              }
              className="mt-2"
            />
            <div className="text-center mt-2 font-medium">
              {formData.stampCount} stamps
            </div>
          </div>
          <div>
            <Label className="text-lg font-semibold mb-2">
              Initial Count of Stamps
            </Label>
            <Slider
              min={0}
              max={formData.stampCount}
              step={1}
              value={[formData.initialStamps]}
              onValueChange={(value) =>
                handleInputChange("initialStamps", value[0])
              }
              className="mt-2"
            />
            <div className="text-center mt-2 font-medium">
              {formData.initialStamps} stamps
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Design",
      content: (
        <div className="space-y-6">
          <div>
            <Label
              htmlFor="backgroundColor"
              className="text-lg font-semibold mb-2"
            >
              Background Color
            </Label>
            <div className="flex items-center space-x-4 mt-2">
              <div className="relative w-16 h-16">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) =>
                    handleInputChange("backgroundColor", e.target.value)
                  }
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  style={{ zIndex: 10 }}
                />
                <div
                  className="w-full h-full rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: formData.backgroundColor }}
                  onClick={() => {
                    const colorInput = document.getElementById(
                      "backgroundColor"
                    ) as HTMLInputElement;
                    colorInput?.click();
                  }}
                />
              </div>

              <span className="font-medium">{formData.backgroundColor}</span>
            </div>
          </div>
          <div>
            <Label htmlFor="textColor" className="text-lg font-semibold mb-2">
              Text Color
            </Label>
            <div className="flex items-center space-x-4 mt-2">
              <div className="relative w-16 h-16">
                <Input
                  id="textColor"
                  type="color"
                  value={formData.textColor}
                  onChange={(e) =>
                    handleInputChange("textColor", e.target.value)
                  }
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  style={{ zIndex: 10 }}
                />

                <div
                  className="w-full h-full rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: formData.textColor }}
                  onClick={() => {
                    const colorInput = document.getElementById(
                      "textColor"
                    ) as HTMLInputElement;
                    colorInput?.click();
                  }}
                />
              </div>

              <span className="font-medium">{formData.textColor}</span>
            </div>
          </div>
          <div>
            <Label htmlFor="stampImage" className="text-lg font-semibold mb-2">
              Stamp Image
            </Label>
            <Input
              id="stampImage"
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileChange("stampImage", e.target.files?.[0])
              }
              className="mt-2"
            />
            {formData.stampImage && (
              <div className="mt-4">
                <img
                  src={formData.stampImage}
                  alt="Stamp Preview"
                  className="w-16 h-16 object-contain border rounded-lg"
                />
              </div>
            )}
          </div>
          <div>
            <Label
              htmlFor="unlockedStampImage"
              className="text-lg font-semibold mb-2"
            >
              Unlocked Stamp Image
            </Label>
            <Input
              id="unlockedStampImage"
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileChange("unlockedStampImage", e.target.files?.[0])
              }
              className="mt-2"
            />
            {formData.unlockedStampImage && (
              <div className="mt-4">
                <img
                  src={formData.unlockedStampImage}
                  alt="Stamp Preview"
                  className="w-16 h-16 object-contain border rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Information",
      content: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="logo" className="text-lg font-semibold mb-2">
              Logo
            </Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("logo", e.target.files?.[0])}
              className="mt-2"
            />
            {formData.logo && (
              <div className="mt-4">
                <img
                  src={formData.logo}
                  alt="Logo Preview"
                  className="w-16 h-16 object-contain border rounded-lg"
                />
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="cardTitle" className="text-lg font-semibold mb-2">
              Card Title
            </Label>
            <Input
              id="cardTitle"
              value={formData.cardTitle}
              onChange={(e) => handleInputChange("cardTitle", e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="subtitle" className="text-lg font-semibold mb-2">
              Subtitle
            </Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
      ),
    },
  ];

  const getStepDescription = (index: number) => {
    switch (index) {
      case 0:
        return "Configure your card";
      case 1:
        return "Customize appearance";
      case 2:
        return "Add card details";
      default:
        return "";
    }
  };

  const Stepper = () => (
    <div className="mb-12 relative">
      <div className="flex justify-between mb-2 relative">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center relative z-10 w-1/3"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                index <= currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100"
              } shadow-lg transition-all duration-300 ease-in-out`}
            >
              {index < currentStep ? (
                <Check className="w-6 h-6" />
              ) : (
                <span
                  className={`text-lg font-bold ${
                    index <= currentStep
                      ? "text-primary-foreground"
                      : "text-gray-400"
                  }`}
                >
                  {index + 1}
                </span>
              )}
            </div>
            <div
              className={`mt-4 text-center transition-all duration-300 ease-in-out ${
                index <= currentStep
                  ? "text-primary scale-110"
                  : "text-gray-400"
              }`}
            >
              <h3 className="text-sm font-bold mb-1">{step.title}</h3>
              <span className="text-xs">{getStepDescription(index)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200 -z-10" />
      <div
        className="absolute top-6 left-0 h-0.5 bg-primary -z-10 transition-all duration-300 ease-in-out"
        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
      />
    </div>
  );

  const PhoneMockup = ({ children }: { children: React.ReactNode }) => (
    <div
      className={`relative w-[280px] h-[580px] ${
        previewDevice === "iphone"
          ? 'bg-gray-800 p-2 rounded-[55px] before:content-[""] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-24 before:h-7 before:bg-black before:rounded-b-3xl'
          : "bg-gray-800 p-2"
      }  shadow-xl`}
    >
      <div
        className={`w-full h-full bg-white ${
          previewDevice === "iphone" ? "rounded-[48px]" : " "
        } overflow-hidden shadow-inner`}
      >
        {children}
      </div>
    </div>
  );

  const PassPreview = () => (
    <div className="h-full bg-white overflow-y-auto">
      <div
        className="p-3 w-[90%] mx-auto space-y-6 mt-8 rounded-xl"
        style={{
          backgroundColor: formData.backgroundColor,
          color: formData.textColor,
        }}
      >
        <div className="space-y-2 text-center ">
          <div className="flex items-center space-x-4  border-b-2">
            {formData.logo && (
              <img
                src={formData.logo}
                alt="Logo"
                className="w-10 h-10 p-1 object-contain rounded-full"
              />
            )}
            <h2 className="text-[1rem] font-semibold">{formData.cardTitle}</h2>
          </div>

          <p className="text-sm font-light text-left">{formData.subtitle}</p>
          <h3 className="text-lg font-semibold text-left">Adam Moutik</h3>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 divide-y">
          <div className="grid grid-cols-5 gap-3 justify-items-center">
            {[...Array(formData.stampCount)].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border-2 ${
                  i < formData.initialStamps
                    ? `bg-primary text-primary-foreground`
                    : "border-gray-300"
                }`}
              >
                {i < formData.initialStamps && formData.unlockedStampImage ? (
                  <img
                    src={formData.unlockedStampImage}
                    alt="Unlocked Stamp"
                    className="w-6 h-6 object-cover"
                  />
                ) : formData.stampImage ? (
                  <img
                    src={formData.stampImage}
                    alt="Stamp"
                    className="w-8 h-8 object-cover"
                  />
                ) : (
                  <Star className="w-5 h-5" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center bg-white mx-auto w-20 h-20 justify-center rounded-md">
          <QrCode size={64} className="text-primary mx-auto" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-gray-50 w-full">
      <div className="w-full sm:w-1/2 p-6 sm:p-12 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Loyalty Pass Generator
        </h1>
        <Stepper />
        <div className="space-y-6">
          {steps.map((step, index) => (
            <Card key={index} className={index === currentStep ? "" : "hidden"}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">{step.title}</h2>
                {step.content}
              </CardContent>
            </Card>
          ))}
          <div className="flex justify-between mt-8">
            <Button
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="px-6 py-2"
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
              }
              disabled={currentStep === steps.length - 1}
              className="px-6 py-2"
            >
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full sm:w-1/2 p-6 sm:p-8 bg-gray-100 flex flex-col items-center">
        <div className="flex gap-4 mb-4">
          <Button
            variant={previewDevice === "iphone" ? "default" : "outline"}
            size="icon"
            onClick={() => setPreviewDevice("iphone")}
            className="w-12 h-12 rounded-full"
          >
            <Apple className="w-6 h-6" />
          </Button>
          <Button
            variant={previewDevice === "android" ? "default" : "outline"}
            size="icon"
            onClick={() => setPreviewDevice("android")}
            className="w-12 h-12 rounded-full"
          >
            <Smartphone className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
        <div className=" flex">
          <Card className="p-8 bg-white shadow-lg rounded-2xl">
            <PhoneMockup>
              <PassPreview />
            </PhoneMockup>
          </Card>
        </div>
      </div>
    </div>
  );
}
