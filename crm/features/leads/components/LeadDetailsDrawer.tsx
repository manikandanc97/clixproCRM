import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { LeadType, NoteType } from "@/shared/types/lead";
import { X, MessageSquare, Calendar, CheckSquare, Clock, Paperclip, Pin, Edit2, Trash2 } from "lucide-react";
import { useCRMStore } from "@/shared/store/useCRMStore";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

interface LeadDetailsDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string | null;
}

export function LeadDetailsDrawer({ isOpen, onOpenChange, leadId }: LeadDetailsDrawerProps) {
  const { leads, updateLead } = useCRMStore();
  const [activeTab, setActiveTab] = useState("notes");

  const lead = leads.find(l => l.id === leadId);

  // Note edit state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState("");

  if (!lead) return null;

  const notes = lead.notes || [];
  
  // Sort notes: Pinned first, then newest first
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleDeleteNote = (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      updateLead(lead.id, {
        notes: notes.filter(n => n.id !== noteId)
      });
      toast.success("Note deleted successfully");
    }
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editMessage.trim()) return;
    
    updateLead(lead.id, {
      notes: notes.map(n => n.id === noteId ? { ...n, message: editMessage, updatedAt: new Date().toISOString() } : n)
    });
    setEditingNoteId(null);
    toast.success("Note updated successfully");
  };

  const startEditing = (note: NoteType) => {
    setEditingNoteId(note.id);
    setEditMessage(note.message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] sm:h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        
        <DialogHeader className="px-6 py-5 border-b border-border flex flex-col items-start bg-muted/20 m-0">
          <div className="flex items-center gap-3 w-full pr-6">
            <Avatar className="w-10 h-10 border shadow-sm">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                {lead.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-base font-bold m-0">{lead.name}</DialogTitle>
              <span className="text-xs text-muted-foreground font-medium">{lead.company}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="px-6 pt-2 border-b border-border bg-background sticky top-0 z-10">
              <TabsList className="w-full flex justify-start bg-transparent p-0 rounded-none h-auto gap-4 overflow-x-auto border-none no-scrollbar">
                <TabsTrigger value="overview" className="rounded-none text-xs font-bold py-3 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground bg-transparent shadow-none">Overview</TabsTrigger>
                <TabsTrigger value="notes" className="rounded-none text-xs font-bold py-3 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground bg-transparent shadow-none gap-1.5 flex items-center">
                  <MessageSquare className="w-3.5 h-3.5" /> Notes
                </TabsTrigger>
                <TabsTrigger value="tasks" className="rounded-none text-xs font-bold py-3 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground bg-transparent shadow-none gap-1.5 flex items-center">
                  <CheckSquare className="w-3.5 h-3.5" /> Tasks
                </TabsTrigger>
                <TabsTrigger value="meetings" className="rounded-none text-xs font-bold py-3 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground bg-transparent shadow-none gap-1.5 flex items-center">
                  <Calendar className="w-3.5 h-3.5" /> Meetings
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-none text-xs font-bold py-3 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground bg-transparent shadow-none gap-1.5 flex items-center">
                  <Clock className="w-3.5 h-3.5" /> History
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 p-6">
              <TabsContent value="overview" className="mt-0 outline-none">
                <div className="text-sm text-muted-foreground">Overview content for {lead.name}...</div>
              </TabsContent>

              <TabsContent value="notes" className="mt-0 outline-none space-y-6">
                {sortedNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-semibold">No Notes Yet</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                      Add internal notes to keep track of conversations and updates.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border -z-10" />

                    {sortedNotes.map((note) => (
                      <div key={note.id} className="flex gap-4 relative">
                        {/* Timeline Dot & Avatar */}
                        <div className="flex flex-col items-center z-10 pt-1">
                          <Avatar className="w-8 h-8 border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                              {note.createdBy.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        {/* Note Content */}
                        <div className="flex-1 bg-card border border-border/60 rounded-xl p-4 shadow-sm relative group">
                          {note.isPinned && (
                            <div className="absolute -top-2.5 -right-2.5 bg-amber-100 border border-amber-200 text-amber-600 rounded-full p-1.5 shadow-sm">
                              <Pin className="w-3.5 h-3.5 fill-current" />
                            </div>
                          )}
                          
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">{note.createdBy}</span>
                                {note.mentions && note.mentions.length > 0 && (
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                                    {note.mentions.join(", ")}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground mt-0.5">
                                <span>{format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                                {note.updatedAt && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span>Edited</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => startEditing(note)}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteNote(note.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {note.title && (
                            <h4 className="text-xs font-bold mb-1.5 text-foreground">{note.title}</h4>
                          )}
                          
                          {editingNoteId === note.id ? (
                            <div className="mt-3 space-y-2">
                              <textarea
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
                                className="w-full text-sm min-h-[80px] p-2 border border-primary/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background resize-none"
                              />
                              <div className="flex items-center gap-2 justify-end">
                                <Button variant="ghost" size="sm" onClick={() => setEditingNoteId(null)} className="h-7 text-xs">Cancel</Button>
                                <Button size="sm" onClick={() => handleSaveEdit(note.id)} className="h-7 text-xs">Save</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                              {note.message}
                            </div>
                          )}

                          {note.attachment && (
                            <div className="mt-3 flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30 w-fit">
                              <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                              <a href={note.attachment.url} target="_blank" rel="noreferrer" className="text-xs font-medium hover:underline text-blue-600">
                                {note.attachment.name}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tasks" className="mt-0 outline-none">
                <div className="text-sm text-muted-foreground">Tasks functionality coming soon.</div>
              </TabsContent>

              <TabsContent value="meetings" className="mt-0 outline-none">
                <div className="text-sm text-muted-foreground">Meetings functionality coming soon.</div>
              </TabsContent>
              
              <TabsContent value="history" className="mt-0 outline-none">
                <div className="text-sm text-muted-foreground">History functionality coming soon.</div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
