"use client";

import React from "react";
import { CRMPageContainer } from "@/shared/components/crm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { SupportTicketForm } from "@/features/help-center/components/SupportTicketForm";
import { LifeBuoy, Book, Info, Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export default function HelpCenterPage() {
  return (
    <CRMPageContainer>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground mt-2">
            Need help with Clixpro? Find documentation, release notes, or raise a support ticket.
          </p>
        </div>

        <Tabs defaultValue="ticket" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl mb-8">
            <TabsTrigger value="ticket" className="gap-2">
              <LifeBuoy className="w-4 h-4" /> Raise Support Ticket ⭐
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2">
              <Book className="w-4 h-4" /> Documentation
            </TabsTrigger>
            <TabsTrigger value="release" className="gap-2">
              <Rocket className="w-4 h-4" /> Release Notes
            </TabsTrigger>
            <TabsTrigger value="version" className="gap-2">
              <Info className="w-4 h-4" /> Version Info
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ticket" className="mt-0">
            <SupportTicketForm />
          </TabsContent>
          
          <TabsContent value="docs" className="mt-0">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>Browse our comprehensive guides and API references.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-b-xl border-t">
                Documentation content goes here.
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="release" className="mt-0">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Release Notes / What's New</CardTitle>
                <CardDescription>Stay up to date with the latest features and bug fixes.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-b-xl border-t">
                Release notes content goes here.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="version" className="mt-0">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Version Information</CardTitle>
                <CardDescription>Current system version details.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-muted/20 rounded-b-xl border-t">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Info className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Clixpro CRM</h3>
                  <p className="text-muted-foreground mt-1">Version 1.0.0</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CRMPageContainer>
  );
}
