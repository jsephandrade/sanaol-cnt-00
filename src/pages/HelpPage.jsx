import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
const HelpPage = () => {
  const faqs = [
    {
      question: 'How do I manage menu items?',
      answer:
        'Navigate to the Menu Management section from the sidebar. You can add, edit, or remove menu items, set prices, and update availability status.',
    },
    {
      question: 'How do I process orders in the POS system?',
      answer:
        'Go to the Point of Sale section, select items from the menu, add them to the cart, and process payment. You can handle cash or card transactions.',
    },
    {
      question: 'How do I view sales analytics?',
      answer:
        'The Sales Analytics page provides comprehensive reports on revenue, popular items, and sales trends. Use the date filters to view specific periods.',
    },
    {
      question: 'How do I schedule employees?',
      answer:
        'In the Employee Schedule section, you can create shifts, assign employees, and manage work schedules. Employees can view their schedules and request changes.',
    },
    {
      question: 'How do I manage inventory?',
      answer:
        "The Inventory section allows you to track stock levels, set reorder points, and manage suppliers. You'll receive alerts when items are running low.",
    },
    {
      question: 'How do I handle customer feedback?',
      answer:
        'Customer feedback is displayed in the Feedback section. You can view, respond to, and mark feedback as resolved to improve customer satisfaction.',
    },
  ];
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-muted-foreground">
          Find answers to common questions and get support for TechnoMart
          Canteen Management System.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Common questions and answers about using the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
          <CardDescription>
            Contact our support team for additional assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Support
            </Button>
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Support Hours</h4>
            <p className="text-sm text-muted-foreground">
              Monday - Friday: 9:00 AM - 6:00 PM
              <br />
              Saturday: 10:00 AM - 4:00 PM
              <br />
              Sunday: Closed
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default HelpPage;
