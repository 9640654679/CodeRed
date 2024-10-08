"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// Load Razorpay SDK
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Mock product data; this would be fetched dynamically in a real scenario
const products = [
  {
    id: '1',
    name: 'Festival T-Shirt',
    description: 'Comfortable and stylish festival t-shirt.',
    price: 299,
    image: 'https://picsum.photos/200',
  },
  {
    id: '2',
    name: 'Festival Cap',
    description: 'Cool cap for festival-goers.',
    price: 149,
    image: 'https://picsum.photos/200',
  },
  {
    id: '3',
    name: 'Festival Mug',
    description: 'Mug for your festival drinks.',
    price: 99,
    image: 'https://picsum.photos/200',
  },
  {
    id: '4',
    name: 'Festival Hoodie',
    description: 'Warm hoodie for cool festival nights.',
    price: 599,
    image: 'https://picsum.photos/200',
  },
];

export default function ProductDetail() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
  });
  
  const { id } = useParams(); // Use next/navigation's useParams to get the product id from the route
  const product = products.find((p) => p.id === id);

  const { user } = useUser();
  const userId = user?.emailAddresses[0]?.emailAddress || "Unknown User";

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Razorpay integration
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isRazorpayLoaded = await loadRazorpayScript();

    if (!isRazorpayLoaded) {
      console.error("Razorpay SDK failed to load. Please try again later.");
      return;
    }

    // Assuming the amount is the product price; Razorpay expects the amount in paise
    const amount = product?.price ? product.price * 100 : 0;

    try {
      const options = {
        key: "rzp_test_7kbetSV9IQQW2J", // Your Razorpay test key
        amount: amount,
        currency: "INR",
        name: "Artly",
        description: `Purchase of ${product?.name}`,
        handler: function (response: any) {
          // Handle payment response
          const paymentResponse = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };
          console.log("Payment successful:", paymentResponse);
          // You can further handle the payment success (e.g., save it in a database)
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error during payment processing:", err);
    }
  };

  if (!product) {
    return <p className="text-center text-xl font-bold">Product not found</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-black">
          <Image
            src={product.image}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="w-full h-full"
          />
        </div>
        
        {/* Product Info */}
        <div className="flex flex-col gap-4 text-black">
          <h1 className="text-4xl font-extrabold">{product.name}</h1>
          <p className="text-lg text-gray-700">{product.description}</p>
          <h2 className="text-2xl font-semibold">Price: ₹{product.price}</h2>

          {/* Purchase Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto bg-black text-white hover:bg-gray-800" size="lg">
                Buy Now
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-black">Complete Your Purchase</DialogTitle>
              </DialogHeader>

              {/* Purchase Form */}
              <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="font-semibold text-gray-800">Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="border-gray-300 focus:border-black"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="font-semibold text-gray-800">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="border-gray-300 focus:border-black"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address" className="font-semibold text-gray-800">Address</Label>
                  <Input
                    id="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="border-gray-300 focus:border-black"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pincode" className="font-semibold text-gray-800">Pincode</Label>
                  <Input
                    id="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="border-gray-300 focus:border-black"
                  />
                </div>

                <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                  Complete Purchase
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
