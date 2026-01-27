
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const services = [
    {
        id: "discovery-call",
        title: "Free Discovery Call",
        slug: "discovery-call",
        icon: "Phone",
        shortDescription: "A complimentary 15-minute chat to discuss your goals and see if we're a fit.",
        fullDescription: "Not sure where to start? Book a free 15-minute discovery call with our nutritionists. We'll discuss your health history, goals, and helps you choose the right plan for your journey.",
        features: [
            "15-minute duration",
            "Discuss your health goals",
            "Plan recommendation",
            "No obligation"
        ],
        targetAudience: "Anyone unsure about which nutrition plan is right for them.",
        color: "text-brand-green",
        bgColor: "bg-brand-green/10",
        priceVirtual: 0,
        priceInPerson: 0,
        isVisible: true,
        displayOrder: 1
    },
    {
        id: "cancer-nutrition",
        title: "Oncology Nutrition Support",
        slug: "cancer-nutrition-support",
        icon: "Activity",
        shortDescription: "Specialized nutritional support for managing treatment side effects and promoting recovery.",
        fullDescription: "Comprehensive nutritional assessment and individualized care plans for various cancer types and stages. We focus on strategies for managing treatment-related side effects (nausea, vomiting, fatigue, taste changes, mucositis) and preventing muscle wasting (cachexia).",
        features: [
            "Management of treatment side effects",
            "Prevention of muscle wasting (cachexia)",
            "Appropriate supplementation guidance",
            "Survivorship and long-term wellness support"
        ],
        targetAudience: "Individuals newly diagnosed, undergoing treatment (chemotherapy, radiation, surgery), or in remission.",
        color: "text-orange",
        bgColor: "bg-orange/10",
        priceVirtual: 3500,
        priceInPerson: 4000,
        isVisible: true,
        displayOrder: 2
    },
    {
        id: "diabetes-management",
        title: "Diabetes Management",
        slug: "diabetes-management",
        icon: "HeartPulse",
        shortDescription: "Blood sugar regulation and lifestyle modification strategies for Type 1, Type 2, and Pre-diabetes.",
        fullDescription: "Individualized meal planning for effective blood sugar regulation. We provide education on the glycemic index, portion control, and meal timing to improve insulin sensitivity and prevent complications.",
        features: [
            "Blood sugar regulation strategies",
            "Glycemic index education",
            "Portion control & meal timing",
            "Pre-diabetes reversal plans"
        ],
        targetAudience: "Newly diagnosed diabetics, pre-diabetics, and those seeking better control.",
        color: "text-brand-green",
        bgColor: "bg-brand-green/10",
        priceVirtual: 3000,
        priceInPerson: 3500,
        isVisible: true,
        displayOrder: 3
    },
    {
        id: "gut-health",
        title: "Digestive & Gut Health",
        slug: "gut-health",
        icon: "Apple",
        shortDescription: "Dietary interventions for IBS, GERD, and other digestive disorders.",
        fullDescription: "Dietary strategies for managing symptoms of Irritable Bowel Syndrome (IBS), Hyperacidity, Gastritis, GERD, and Crohn's disease. We offer guidance on elimination diets (FODMAP) and gut microbiome optimization.",
        features: [
            "Symptom management (Bloating, Acid Reflux)",
            "FODMAP & Elimination diets",
            "Gut microbiome optimization",
            "Reintroduction protocols"
        ],
        targetAudience: "Individuals with persistent digestive discomfort or diagnosed conditions.",
        color: "text-olive",
        bgColor: "bg-olive/10",
        priceVirtual: 3000,
        priceInPerson: 3500,
        isVisible: true,
        displayOrder: 4
    },
    {
        id: "general-counselling",
        title: "General Nutrition Counselling",
        slug: "general-counselling",
        icon: "Scale",
        shortDescription: "Weight management, hypertension control, and general wellness guidance.",
        fullDescription: "Holistic support for healthy weight loss or gain, cholesterol management, and hypertension control. We also offer renal nutrition guidance and general preventive care.",
        features: [
            "Weight Management (Loss/Gain)",
            "Hypertension & Cholesterol Control",
            "Renal (Kidney) Nutrition",
            "Preventive Care"
        ],
        targetAudience: "Anyone seeking to improve their general health and prevent chronic diseases.",
        color: "text-olive",
        bgColor: "bg-olive/10",
        priceVirtual: 2500,
        priceInPerson: 3000,
        isVisible: true,
        displayOrder: 5
    },
]

async function main() {
    console.log(`Start seeding services...`)
    for (const s of services) {
        const service = await prisma.service.upsert({
            where: { id: s.id },
            update: s,
            create: s,
        })
        console.log(`Upserted service with id: ${service.id}`)
    }
    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
