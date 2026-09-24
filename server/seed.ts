import { prisma } from "./config/prisma.js"
import { Prisma } from "./generated/prisma/client.js"
const seedDB = async () =>{
    try {
        await prisma.product.deleteMany({})
        console.log("Cleared existing products")
const products: Prisma. ProductCreateManyInput[] =  [
    {
       
        name: "Fresh Avocado",
        description: "Creamy and rich in healthy fats",
        price: 45,
        originalPrice: 50,
        image: "/avocado.jfif",
        category: "fruits-vegetables",
        unit: "100g",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
       
        
       
        
    },
    {
        
        name: "Fresh Banana 500g",
        description: "Sweet, ripe, and rich in potassium",
        price: 420,
        originalPrice: 450,
        image: "/banana.jfif",
        category: "fruits-vegetables",
        unit: "500g",
        stock: 100,
        isOrganic: true,
        rating: 4.5,
        reviewCount: 12,
        
        
       
    
    },
    {
       
        name: "Fresh Garlic 400g",
        description: "Aromatic and flavorful",
        price: 35,
        originalPrice: 40,
        image: "/garlic.jfif",
        category: "fruits-vegetables",
        unit: "400g",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
       
        
        
    },
    {
       
        name: "Organic Broccoli (2 heads)",
        description: "Fresh and nutrient-rich",
        price: 35,
        originalPrice: 40,
        image: "/Brocoli biologique ( 2 tête).jfif",
        category: "fruits-vegetables",
        unit: "400g",
        stock: 100,
        isOrganic: true,
        rating: 4.5,
        reviewCount: 12,
        
    },
    {
       
        name: "Fresh Watermelon 1kg",
        description: "Juicy, sweet, and refreshing",
        price: 140,
        originalPrice: 150,
        image: "/Watermelon.jfif",
        category: "fruits-vegetables",
        unit: "1kg",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
       
    },
    {
      
        name: "Fresh Red Onion 70g",
        description: "Crisp with a strong, pungent flavor",
        price: 30,
        originalPrice: 35,
        image: "/onion.jfif",
        category: "fruits-vegetables",
        unit: "70g",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
     
    },
    {
       
        name: "Ripe Tomato 280g",
        description: "Juicy and ripe",
        price: 50,
        originalPrice: 55,
        image: "/tomato.jfif",
        category: "fruits-vegetables",
        unit: "280g",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
        
    },
    {
       
        name: "Bell Pepper",
        description: "Crisp and fresh",
        price: 60,
        originalPrice: 75,
        image: "/paper.jpg",
        category: "fruits-vegetables",
        unit: "1.5L",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
       
    },
    {
      
        name: "Garlic Butter Potatoes",
        description: "Tender and herb-roasted",
        price: 44,
        originalPrice: 50,
        image: "/Garlic Butter Potatoes recipe.jfif",
        category: "pantry-staples",
        unit: "500g",
        stock: 100,
        isOrganic: true,
        rating: 4.5,
        reviewCount: 12,
        
    },
    {
       
        name: "Fresh Spinach 500g",
        description: "Iron-rich leafy greens",
        price: 75,
        originalPrice: 80,
        image: "/spinach-removebg-preview.png",
        category: "fruits-vegetables",
        unit: "1.5L",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
    },   
    {
       
        name: "Fresh Cabbage 1kg",
        description: "Crisp leafy cabbage",
        price: 110,
        originalPrice: 120,
        image: "/Cabbage.jfif",
        category: "fruits-vegetables",
        unit: "1kg",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
       
    },
    {
        
        name: "Eggs 12 pcs",
        description: "Farm fresh and high in protein",
        price: 85,
        originalPrice: 90,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/cnjrpbcnqesqxy1wr30g.png",
        category: "dairy-eggs",
        unit: "12pcs",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
        
    },
    {
       
        name: "Banana 1 kg",
        description: "Sweet, ripe, and energy-packed",
        price: 45,
        originalPrice: 50,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/dsnmko6gqtyw31okby80.png",
        category: "fruits-vegetables",
        unit: "1kg",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
        
    },
    {
      
        name: "Basmati Rice 5kg",
        description: "Aromatic long-grain rice",
        price: 520,
        originalPrice: 550,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/evuovl2nlwdjukosfz23.png",
        category: "pantry-staples",
        unit: "5kg",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
      
    },
    {
      
        name: "Onion 500g",
        description: "Essential, fresh kitchen staple",
        price: 45,
        originalPrice: 50,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/wnvtwlm2tphqburhsmyc.png",
        category: "fruits-vegetables",
        unit: "500g",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
       
    },
    {
      
        name: "7 Up 1.5L",
        description: "Crisp lemon-lime soda",
        price: 70,
        originalPrice: 76,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/qt1ypzsoqni12ghf2ryp.png",
        category: "beverages",
        unit: "1.5L",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
        
    },
    {
       
        name: "Spinach 500g",
        description: "Fresh, vitamin-packed greens",
        price: 15,
        originalPrice: 18,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/bhrtl76sscvmeiq4kchm.png",
        category: "fruits-vegetables",
        unit: "500g",
        stock: 100,
        isOrganic: true,
        rating: 4.5,
        reviewCount: 12,
        
    },
    {
        
        name: "Orange 1 kg",
        description: "Juicy and Vitamin C-rich",
        price: 75,
        originalPrice: 80,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/r1wxfortw5h12g7egx7k.png",
        category: "fruits-vegetables",
        unit: "1kg",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
        
    },
    {
       
        name: "Wheat Flour 5kg",
        description: "Whole wheat flour for soft rotis",
        price: 230,
        originalPrice: 250,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/ooitbkcjcky0gkjmkatb.png",
        category: "pantry-staples",
        unit: "5kg",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
      
    },
    {
      
        name: "Grapes 500g",
        description: "Sweet, juicy, and antioxidant-rich",
        price: 65,
        originalPrice: 70,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/jsmb7caaokhnyci2coga.png",
        category: "fruits-vegetables",
        unit: "500g",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
      
    },
    {
      
        name: "Fanta 1.5L",
        description: "Fizzy orange soda",
        price: 65,
        originalPrice: 70,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/nexecd3mgyzrpeun1bee.png",
        category: "beverages",
        unit: "1.5L",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
       
    },
    {
     
        name: "Paneer 200g",
        description: "Soft, protein-rich cottage cheese",
        price: 85,
        originalPrice: 90,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/vihqr6wquv57byurvz46.png",
        category: "dairy-eggs",
        unit: "200g",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
       
    },
    {
    
        name: "Mango 1 kg",
        description: "Sweet, flavorful, and Vitamin A-rich",
        price: 140,
        originalPrice: 150,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/nb1mpxuo4fdcik6ey5yj.png",
        category: "fruits-vegetables",
        unit: "1kg",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
       
    },
    {
     
        name: "Tomato 1 kg",
        description: "Juicy, ripe, and farm fresh",
        price: 28,
        originalPrice: 30,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/kdbfytxisrjymgy0ubhk.png",
        category: "fruits-vegetables",
        unit: "1kg",
        stock: 100,
        isOrganic: true,
        rating: 4.5,
        reviewCount: 12,
       
    },
    {
      
        name: "Potato 500g",
        description: "Fresh, versatile organic potatoes",
        price: 35,
        originalPrice: 40,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/tzibj2ntsnbn4e0u5kwv.png",
        category: "fruits-vegetables",
        unit: "500g",
        stock: 100,
        isOrganic: true,
        rating: 4.5,
        reviewCount: 12,
       
    },
    {
     
        name: "Cheese 200g",
        description: "Creamy and calcium-rich",
        price: 130,
        originalPrice: 140,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/gek3mmiig3lixlkpxks8.png",
        category: "dairy-eggs",
        unit: "200g",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
        
    },
    {
       
        name: "Amul Milk 1L",
        description: "Fresh, calcium-rich milk",
        price: 55,
        originalPrice: 60,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/ooamzy497lhsj2gjuwby.png",
        category: "dairy-eggs",
        unit: "1L",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
      
    },
    {
         name: "Apple 1 kg",
        description: "Crisp, fiber-rich, and healthy",
        price: 90,
        originalPrice: 100,
        image: "https://raw.githubusercontent.com/avinashdm/gs-images/main/greencart/pjt1y6xdo46tluemhf0o.png",
        category: "fruits-vegetables",
        unit: "1kg",
        stock: 100,
        isOrganic: false,
        rating: 4.5,
        reviewCount: 12,
       
    },
];

await prisma.product.createMany({data: products})
console.log(`cleard ${products.length} products`);


 console.log("seed completed successfully")
 process.exit(0)

} catch (error) {
    console.error("seed error:", error)
    process.exit(1)
}finally{
    prisma.$disconnect()
}
}

seedDB()