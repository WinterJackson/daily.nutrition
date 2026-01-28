"use client"

import { createService, deleteService, toggleServiceVisibility, updateService } from "@/app/actions/services"
import { uploadImage } from "@/app/actions/upload"
import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { DollarSign, Edit, Eye, EyeOff, Plus, Save, Trash2, Upload, X } from "lucide-react"
import Image from "next/image"
import { useRef, useState, useTransition } from "react"

interface Service {
  id: string
  slug: string
  title: string
  shortDescription: string
  fullDescription: string | null
  features: string[]
  targetAudience: string | null
  image: string | null
  icon: string
  color: string
  bgColor: string
  priceVirtual: number | null
  priceInPerson: number | null
  isVisible: boolean
  displayOrder: number
}

interface ServicesEditorProps {
  services: Service[]
}

export function ServicesEditor({ services }: ServicesEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<Partial<Service>>({})
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCreate = () => {
    setIsCreating(true)
    setEditingService({ id: "new" } as Service) // Hack to open modal
    setFormData({
      title: "",
      shortDescription: "",
      fullDescription: "",
      features: [],
      targetAudience: "",
      priceVirtual: 0,
      priceInPerson: 0,
      image: null
    })
  }

  const handleEdit = (service: Service) => {
    setIsCreating(false)
    setEditingService(service)
    setFormData({
      title: service.title,
      shortDescription: service.shortDescription,
      fullDescription: service.fullDescription || "",
      features: service.features,
      targetAudience: service.targetAudience || "",
      priceVirtual: service.priceVirtual || 0,
      priceInPerson: service.priceInPerson || 0,
      image: service.image
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
        startTransition(async () => {
            await deleteService(id)
        })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
        const data = new FormData()
        data.append("file", file)
        const res = await uploadImage(data)
        if (res.success && res.url) {
            setFormData(prev => ({ ...prev, image: res.url }))
        } else {
            console.error("Upload failed", res.error)
            alert("Image upload failed")
        }
    } finally {
        setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }))
  }

  const handleSave = () => {
    if (!editingService) return
    
    // Validation
    if (!formData.title || !formData.shortDescription) {
        alert("Title and Short Description are required")
        return
    }

    startTransition(async () => {
      if (isCreating) {
        // Construct create data with defaults for optional fields if needed
        const createData = {
            title: formData.title!,
            shortDescription: formData.shortDescription!,
            fullDescription: formData.fullDescription || undefined,
            features: formData.features || [],
            targetAudience: formData.targetAudience || undefined,
            priceVirtual: formData.priceVirtual || undefined,
            priceInPerson: formData.priceInPerson || undefined,
            isVisible: formData.isVisible ?? true,
            image: formData.image || undefined
        }
        await createService(createData)
      } else {
        // Construct update data
        await updateService(editingService.id, {
             ...formData,
             fullDescription: formData.fullDescription || undefined,
             targetAudience: formData.targetAudience || undefined,
             priceVirtual: formData.priceVirtual || undefined,
             priceInPerson: formData.priceInPerson || undefined,
             image: formData.image || undefined, // undefined allows null update if handled or ignored, Prisma expects null for clearing. Actions type allows optional.
        })
      }
      setEditingService(null)
      setIsCreating(false)
    })
  }

  const handleToggleVisibility = (id: string) => {
    startTransition(async () => {
      await toggleServiceVisibility(id)
    })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])]
    newFeatures[index] = value
    setFormData({ ...formData, features: newFeatures })
  }

  const addFeature = () => {
    setFormData({ ...formData, features: [...(formData.features || []), ""] })
  }

  const removeFeature = (index: number) => {
    const newFeatures = (formData.features || []).filter((_, i) => i !== index)
    setFormData({ ...formData, features: newFeatures })
  }

  return (
    <>
      {/* Add Button */}
      <div className="p-4 border-b border-neutral-100 dark:border-white/5 flex justify-end">
        <Button onClick={handleCreate} className="bg-brand-green hover:bg-brand-green/90 text-white" data-tooltip="Create New Service">
            <Plus className="w-4 h-4 mr-2" /> Add Service
        </Button>
      </div>

      {/* Services List */}
      <div className="divide-y divide-neutral-100 dark:divide-white/5">
        {services.map((service) => (
          <div
            key={service.id}
            className="p-4 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0 flex items-center gap-4">
              {service.image && (
                <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-neutral-200 dark:border-white/10">
                    <Image src={service.image} alt={service.title} fill className="object-cover" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-olive dark:text-off-white">{service.title}</span>
                    {!service.isVisible && (
                    <span className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-white/5 text-neutral-500 rounded-full">Hidden</span>
                    )}
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{service.shortDescription}</p>
                <div className="flex gap-4 mt-1 text-xs text-neutral-400">
                    <span><DollarSign className="w-3 h-3 inline" /> Virtual: Ksh {service.priceVirtual?.toLocaleString() || 'N/A'}</span>
                    <span><DollarSign className="w-3 h-3 inline" /> In-Person: Ksh {service.priceInPerson?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-neutral-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full"
                onClick={() => handleEdit(service)}
                disabled={isPending}
                data-tooltip="Edit Service Details"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 rounded-full ${
                  service.isVisible
                    ? "text-brand-green hover:text-red-500 hover:bg-red-500/10"
                    : "text-neutral-400 hover:text-brand-green hover:bg-brand-green/10"
                }`}
                onClick={() => handleToggleVisibility(service.id)}
                disabled={isPending}
                data-tooltip={service.isVisible ? "Hide Service" : "Show Service"}
              >
                {service.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                onClick={() => handleDelete(service.id)}
                disabled={isPending}
                data-tooltip="Delete Service"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Add New Service" : "Edit Service"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            
            {/* Image Upload */}
            <div>
               <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2 block">Service Image</label>
               <input 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 ref={fileInputRef}
                 onChange={handleImageUpload}
               />
               
               {formData.image ? (
                 <div className="relative w-full h-40 rounded-lg overflow-hidden border border-neutral-200 dark:border-white/10 group">
                    <Image src={formData.image} alt="Service preview" fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>Change</Button>
                        <Button size="sm" variant="destructive" onClick={handleRemoveImage}>Remove</Button>
                    </div>
                 </div>
               ) : (
                 <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-full h-32 border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                 >
                    {isUploading ? (
                        <div className="animate-spin w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full" />
                    ) : (
                        <>
                            <Upload className="w-6 h-6 text-neutral-400 mb-2" />
                            <span className="text-xs text-neutral-500">Click to upload image</span>
                        </>
                    )}
                 </div>
               )}
            </div>

            {/* Title */}
            <div>
                <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Title</label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Ketogenic Diet Consultation"
                  className="mt-1"
                />
            </div>

            {/* Short Description */}
            <div>
              <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Short Description</label>
              <textarea
                value={formData.shortDescription || ""}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                rows={2}
                placeholder="Brief summary for list view"
                className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 text-sm"
              />
            </div>

            {/* Full Description */}
            <div>
              <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Full Description</label>
              <textarea
                value={formData.fullDescription || ""}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                rows={4}
                placeholder="Detailed description for service page"
                className="mt-1 w-full rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 text-sm"
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Virtual Price (KES)</label>
                <Input
                  type="number"
                  value={formData.priceVirtual || 0}
                  onChange={(e) => setFormData({ ...formData, priceVirtual: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">In-Person Price (KES)</label>
                <Input
                  type="number"
                  value={formData.priceInPerson || 0}
                  onChange={(e) => setFormData({ ...formData, priceInPerson: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Target Audience</label>
              <Input
                value={formData.targetAudience || ""}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="Who is this service for?"
                className="mt-1"
              />
            </div>

            {/* Features */}
            <div>
              <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2 block">Features</label>
              {(formData.features || []).map((feature, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    placeholder={`Feature ${idx + 1}`}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeFeature(idx)} data-tooltip="Remove Feature">
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addFeature} className="mt-2" data-tooltip="Add New Feature Point">
                + Add Feature
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingService(null)}>
                Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending} className="bg-brand-green hover:bg-brand-green/90">
                <Save className="w-4 h-4 mr-2" /> {isPending ? "Saving..." : isCreating ? "Create Service" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
