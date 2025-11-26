"""
Data loader for knowledge base documents.
"""
import json
import os
from typing import List, Dict, Any

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")


def load_wikipedia_articles() -> List[Dict[str, Any]]:
    """Load Wikipedia articles for the fact-checking challenge."""
    articles_file = os.path.join(DATA_DIR, "wikipedia_articles", "articles.json")
    
    if os.path.exists(articles_file):
        with open(articles_file, "r") as f:
            return json.load(f)
    
    # Return default articles if file doesn't exist
    return get_default_wikipedia_articles()


def load_zoning_laws() -> List[Dict[str, Any]]:
    """Load zoning law documents for the legal challenge."""
    laws_file = os.path.join(DATA_DIR, "zoning_laws", "alphaville_code.json")
    
    if os.path.exists(laws_file):
        with open(laws_file, "r") as f:
            return json.load(f)
    
    # Return default laws if file doesn't exist
    return get_default_zoning_laws()


def get_default_wikipedia_articles() -> List[Dict[str, Any]]:
    """Default Wikipedia articles covering various topics."""
    return [
        # Landmarks & Architecture
        {
            "id": "wiki_eiffel_tower",
            "content": "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France. It was constructed from 1887 to 1889 as the centerpiece of the 1889 World's Fair, celebrating the centennial of the French Revolution. Named after the engineer Gustave Eiffel, whose company designed and built the tower, it stands 330 metres (1,083 ft) tall. The tower was initially criticized by some of France's leading artists and intellectuals for its design, but it has become a global cultural icon of France.",
            "metadata": {"category": "landmarks", "topic": "Eiffel Tower"}
        },
        {
            "id": "wiki_great_wall",
            "content": "The Great Wall of China is a series of fortifications made of stone, brick, tamped earth, and other materials, built along the northern borders of China to protect against various nomadic groups. Several walls were built from as early as the 7th century BC. The most well-known sections were built by the Ming Dynasty (1368–1644). Contrary to popular belief, the Great Wall is NOT visible from the Moon with the naked eye. This myth has been debunked by astronauts, including those from Apollo missions. The wall is only about 15-30 feet wide, far too narrow to be seen from such a distance.",
            "metadata": {"category": "landmarks", "topic": "Great Wall of China"}
        },
        {
            "id": "wiki_mount_everest",
            "content": "Mount Everest is Earth's highest mountain above sea level, located in the Mahalangur Himal sub-range of the Himalayas. The China–Nepal border runs across its summit point. Its elevation of 8,848.86 m (29,031.7 ft) was established in 2020 by the Chinese and Nepalese authorities. Mount Everest attracts many climbers, including highly experienced mountaineers. The mountain straddles the border between Nepal and Tibet (China's Tibet Autonomous Region).",
            "metadata": {"category": "geography", "topic": "Mount Everest"}
        },
        
        # Scientists & Inventors
        {
            "id": "wiki_einstein",
            "content": "Albert Einstein (14 March 1879 – 18 April 1955) was a German-born theoretical physicist who is widely held to be one of the greatest and most influential scientists of all time. He was born in Ulm, in the Kingdom of Württemberg in the German Empire. Einstein developed the theory of relativity, one of the two pillars of modern physics. His work is also known for its influence on the philosophy of science. His mass–energy equivalence formula E = mc² has been called 'the world's most famous equation'.",
            "metadata": {"category": "scientists", "topic": "Albert Einstein"}
        },
        {
            "id": "wiki_newton",
            "content": "Sir Isaac Newton (25 December 1642 – 20 March 1726/27) was an English mathematician, physicist, astronomer, alchemist, theologian, and author who is widely recognised as one of the greatest mathematicians and physicists of all time. His book Philosophiæ Naturalis Principia Mathematica ('Mathematical Principles of Natural Philosophy'), first published in 1687, established classical mechanics. Newton also made seminal contributions to optics and shares credit with Gottfried Wilhelm Leibniz for developing infinitesimal calculus.",
            "metadata": {"category": "scientists", "topic": "Isaac Newton"}
        },
        {
            "id": "wiki_curie",
            "content": "Marie Skłodowska Curie (7 November 1867 – 4 July 1934) was a Polish and naturalized-French physicist and chemist who conducted pioneering research on radioactivity. She was the first woman to win a Nobel Prize, the first person to win a Nobel Prize twice, and the only person to win a Nobel Prize in two scientific fields. She discovered two elements: polonium and radium. Her husband Pierre Curie was also a Nobel laureate.",
            "metadata": {"category": "scientists", "topic": "Marie Curie"}
        },
        
        # Literature & Arts
        {
            "id": "wiki_shakespeare",
            "content": "William Shakespeare (bapt. 26 April 1564 – 23 April 1616) was an English playwright, poet, and actor. He is widely regarded as the greatest writer in the English language. Shakespeare produced most of his known works between 1589 and 1613. His plays have been translated into every major living language. Scholars have attributed varying numbers of plays to Shakespeare, but the current scholarly consensus recognizes 39 plays as his, including collaborations. His early plays were primarily comedies and histories. He then wrote mainly tragedies until 1608, including Hamlet, Othello, King Lear, and Macbeth.",
            "metadata": {"category": "literature", "topic": "William Shakespeare"}
        },
        {
            "id": "wiki_van_gogh",
            "content": "Vincent Willem van Gogh (30 March 1853 – 29 July 1890) was a Dutch Post-Impressionist painter who posthumously became one of the most famous and influential figures in Western art history. In a decade, he created about 2,100 artworks, including around 860 oil paintings. A common myth states that van Gogh sold only one painting during his lifetime, but historical records show he sold at least two paintings: 'The Red Vineyard' and a self-portrait to his brother Theo's employer. However, he was commercially unsuccessful during his lifetime and was largely dependent on his brother Theo for financial support.",
            "metadata": {"category": "arts", "topic": "Vincent van Gogh"}
        },
        
        # Science & Nature
        {
            "id": "wiki_water_properties",
            "content": "Water is an inorganic compound with the chemical formula H₂O. It is a transparent, tasteless, odorless, and nearly colorless chemical substance. Water's boiling point depends on atmospheric pressure. At standard atmospheric pressure (1 atm or 101.325 kPa), which occurs at sea level, water boils at exactly 100 degrees Celsius (212 degrees Fahrenheit). At higher altitudes where atmospheric pressure is lower, water boils at temperatures below 100°C. For example, at the top of Mount Everest, water boils at approximately 70°C.",
            "metadata": {"category": "science", "topic": "Water Properties"}
        },
        {
            "id": "wiki_speed_of_light",
            "content": "The speed of light in vacuum, commonly denoted c, is a universal physical constant that is exactly 299,792,458 metres per second (approximately 300,000 kilometres per second or 186,000 miles per second). This is often rounded to 3 × 10⁸ m/s for calculations. According to the special theory of relativity, c is the upper limit for the speed at which conventional matter or energy can travel through space. Light traveling through a medium (such as water or glass) travels at a speed less than c.",
            "metadata": {"category": "science", "topic": "Speed of Light"}
        },
        {
            "id": "wiki_human_anatomy",
            "content": "The adult human skeleton is made up of 206 bones. These include the bones of the skull, spine (vertebral column), ribs, arms and legs. Bones are connected to other bones by ligaments. Babies are born with approximately 270 to 300 bones, but many of these fuse together during development, resulting in the adult count of 206. The skeletal system serves several functions including support, movement, protection, blood cell production, and mineral storage.",
            "metadata": {"category": "science", "topic": "Human Anatomy"}
        },
        
        # Geography & Rivers
        {
            "id": "wiki_amazon_river",
            "content": "The Amazon River is the largest river by discharge volume of water in the world, and the second-longest river in the world after the Nile. The river originates in the Andes Mountains of Peru as the Mantaro River. While the Nile is slightly longer at approximately 6,650 km (4,130 mi), the Amazon carries more water than any other river. The Amazon at approximately 6,400 km (4,000 mi) is the second-longest river. Some recent studies have suggested the Amazon might be longer, but the Nile is still generally accepted as the longest.",
            "metadata": {"category": "geography", "topic": "Amazon River"}
        },
        {
            "id": "wiki_nile_river",
            "content": "The Nile is a major north-flowing river in northeastern Africa. It is the longest river in Africa and has historically been considered the longest river in the world, at about 6,650 km (4,130 mi) long. The Nile has two major tributaries: the White Nile and the Blue Nile. The source of the White Nile is the Great Lakes region of central Africa, while the Blue Nile begins in Ethiopia. The Nile was essential to the development of ancient Egypt.",
            "metadata": {"category": "geography", "topic": "Nile River"}
        },
        
        # History & Events
        {
            "id": "wiki_world_war_2",
            "content": "World War II (1 September 1939 – 2 September 1945) was a global conflict that involved the vast majority of the world's countries forming two opposing military alliances: the Allies and the Axis powers. It was the deadliest conflict in human history, resulting in 70 to 85 million fatalities. The war began with the invasion of Poland by Nazi Germany and ended with the surrender of Japan following the atomic bombings of Hiroshima and Nagasaki.",
            "metadata": {"category": "history", "topic": "World War II"}
        },
        {
            "id": "wiki_moon_landing",
            "content": "The Apollo 11 mission was the American spaceflight that first landed humans on the Moon. Commander Neil Armstrong and lunar module pilot Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969, at 20:17 UTC, and Armstrong became the first person to step onto the Moon's surface six hours and 39 minutes later, on July 21 at 02:56 UTC. Aldrin joined him 19 minutes later.",
            "metadata": {"category": "history", "topic": "Moon Landing"}
        },
        
        # Additional articles for variety
        {
            "id": "wiki_pythagoras",
            "content": "Pythagoras of Samos (c. 570 – c. 495 BC) was an ancient Ionian Greek philosopher and the eponymous founder of Pythagoreanism. His political and religious teachings were well known in Magna Graecia and influenced the philosophies of Plato, Aristotle, and, through them, Western philosophy. The Pythagorean theorem, which states that in a right triangle, the square of the hypotenuse equals the sum of the squares of the other two sides, is attributed to him.",
            "metadata": {"category": "scientists", "topic": "Pythagoras"}
        },
        {
            "id": "wiki_dna",
            "content": "Deoxyribonucleic acid (DNA) is a polymer composed of two polynucleotide chains that coil around each other to form a double helix. The structure of DNA was discovered by James Watson and Francis Crick in 1953, with crucial contributions from Rosalind Franklin and Maurice Wilkins. DNA carries genetic instructions for the development, functioning, growth, and reproduction of all known organisms and many viruses.",
            "metadata": {"category": "science", "topic": "DNA"}
        },
        {
            "id": "wiki_climate_change",
            "content": "Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, such as through variations in the solar cycle, but since the 1800s, human activities have been the main driver of climate change, primarily due to burning fossil fuels like coal, oil, and gas. The global average temperature has increased by about 1.1°C since the pre-industrial era.",
            "metadata": {"category": "science", "topic": "Climate Change"}
        },
        {
            "id": "wiki_internet",
            "content": "The Internet is a global network of interconnected computer networks that use the standard Internet protocol suite (TCP/IP) to communicate. It began as ARPANET in the late 1960s, funded by the U.S. Department of Defense. Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN. The Web is a system of interlinked hypertext documents accessed via the Internet.",
            "metadata": {"category": "technology", "topic": "Internet"}
        },
        {
            "id": "wiki_democracy",
            "content": "Democracy is a form of government in which the people have the authority to deliberate and decide legislation, or to choose governing officials to do so. The term appeared in the 5th century BC in Greek city-states, notably Athens, to mean 'rule by the people'. The modern concept of democracy differs from ancient democracy in that it typically involves representative government rather than direct participation.",
            "metadata": {"category": "politics", "topic": "Democracy"}
        }
    ]


def get_default_zoning_laws() -> List[Dict[str, Any]]:
    """Default Alphaville Zoning Code with intentional conflicts."""
    return [
        # Zone A - Commercial
        {
            "id": "clause_A_1",
            "content": "ZONE A - COMMERCIAL DISTRICT: Zone A is designated for commercial activities including retail stores, restaurants, offices, and service establishments. Residential use is prohibited in Zone A unless granted special variance by the Zoning Board.",
            "metadata": {"zone": "A", "category": "general", "section": "1"}
        },
        {
            "id": "clause_A_2",
            "content": "ZONE A HEIGHT LIMITS: Buildings in Zone A shall not exceed 6 stories or 75 feet in height, whichever is less. Rooftop mechanical equipment may extend an additional 15 feet above the height limit.",
            "metadata": {"zone": "A", "category": "height", "section": "2"}
        },
        {
            "id": "clause_A_3",
            "content": "ZONE A LOT COVERAGE: Maximum lot coverage in Zone A-Commercial shall be 80% of the total lot area. Green space or landscaping must comprise at least 10% of the lot.",
            "metadata": {"zone": "A", "category": "coverage", "section": "3"}
        },
        {
            "id": "clause_A_4",
            "content": "ZONE A PARKING: Commercial establishments in Zone A must provide 1 parking space per 300 square feet of floor area. Restaurants must provide 1 parking space per 4 seats plus 1 space per 2 employees.",
            "metadata": {"zone": "A", "category": "parking", "section": "4"}
        },
        
        # Zone B - Mixed Use
        {
            "id": "clause_B_1",
            "content": "ZONE B - MIXED USE DISTRICT: Zone B permits both commercial and residential uses. Ground floor commercial with upper-floor residential is encouraged. Standalone residential buildings are permitted.",
            "metadata": {"zone": "B", "category": "general", "section": "1"}
        },
        {
            "id": "clause_B_2",
            "content": "ZONE B HEIGHT LIMITS: Buildings in Zone B shall not exceed 4 stories or 50 feet for residential structures. Mixed-use buildings may reach 5 stories or 60 feet maximum.",
            "metadata": {"zone": "B", "category": "height", "section": "2"}
        },
        {
            "id": "clause_B_2_conflict",
            "content": "ZONE B HEIGHT EXCEPTION: Notwithstanding clause B.2, residential buildings in Zone B may be constructed up to 2 stories only when located within 500 feet of Zone R-1 boundaries to maintain neighborhood character.",
            "metadata": {"zone": "B", "category": "height", "section": "2.1"}
        },
        {
            "id": "clause_B_3",
            "content": "ZONE B SETBACKS: Front setback minimum 15 feet. Side setbacks minimum 10 feet each. Rear setback minimum 20 feet. Corner lots must maintain 15-foot setbacks on both street-facing sides.",
            "metadata": {"zone": "B", "category": "setbacks", "section": "3"}
        },
        {
            "id": "clause_B_4",
            "content": "ZONE B ACCESSORY STRUCTURES: Sheds, garages, and accessory structures in Zone B may not exceed 2 stories or 25 feet in height. Total accessory structure footprint shall not exceed 30% of rear yard area.",
            "metadata": {"zone": "B", "category": "accessory", "section": "4"}
        },
        
        # Zone R-1 - Single Family Residential
        {
            "id": "clause_R1_1",
            "content": "ZONE R-1 - SINGLE FAMILY RESIDENTIAL: Zone R-1 is exclusively for single-family detached dwellings. Each lot must contain only one primary dwelling unit. Home occupations are permitted with restrictions.",
            "metadata": {"zone": "R-1", "category": "general", "section": "1"}
        },
        {
            "id": "clause_R1_2",
            "content": "ZONE R-1 HEIGHT LIMITS: Structures in Zone R-1 shall not exceed 2.5 stories or 35 feet in height. Chimneys and architectural features may extend 5 feet above the roofline.",
            "metadata": {"zone": "R-1", "category": "height", "section": "2"}
        },
        {
            "id": "clause_R1_3",
            "content": "ZONE R-1 HOME OCCUPATIONS: Home-based businesses are permitted in Zone R-1 provided: (a) no more than 25% of floor area is used for business, (b) no external signage, (c) no customer visits exceeding 5 per day, (d) no employees other than household residents. Food preparation businesses (bakeries, catering) are PROHIBITED due to health and safety concerns.",
            "metadata": {"zone": "R-1", "category": "home_business", "section": "3"}
        },
        {
            "id": "clause_R1_3_exception",
            "content": "ZONE R-1 HOME OCCUPATION EXCEPTION: Home-based food businesses (cottage food operations) may be permitted in Zone R-1 with a Special Use Permit from the Health Department, limited to non-hazardous baked goods and confections with annual revenue not exceeding $50,000.",
            "metadata": {"zone": "R-1", "category": "home_business", "section": "3.1"}
        },
        {
            "id": "clause_R1_4",
            "content": "ZONE R-1 LOT SIZE: Minimum lot size in Zone R-1 is 10,000 square feet (approximately 0.23 acres). Lot subdivision is permitted only if resulting parcels each meet the minimum lot size requirement.",
            "metadata": {"zone": "R-1", "category": "lot_size", "section": "4"}
        },
        
        # Zone R-2 - Multi-Family Residential
        {
            "id": "clause_R2_1",
            "content": "ZONE R-2 - MULTI-FAMILY RESIDENTIAL: Zone R-2 permits single-family homes, duplexes, triplexes, and apartment buildings up to 12 units. Conversion of single-family homes to multi-family use requires site plan approval.",
            "metadata": {"zone": "R-2", "category": "general", "section": "1"}
        },
        {
            "id": "clause_R2_2",
            "content": "ZONE R-2 HEIGHT LIMITS: Buildings in Zone R-2 shall not exceed 3 stories or 40 feet in height for structures containing 4 or fewer units. Buildings with 5-12 units may reach 4 stories or 50 feet.",
            "metadata": {"zone": "R-2", "category": "height", "section": "2"}
        },
        {
            "id": "clause_R2_3",
            "content": "ZONE R-2 ACCESSORY STRUCTURES: Detached garages in Zone R-2 are limited to 600 square feet maximum footprint and 15 feet in height. Structures exceeding 400 square feet require a building permit.",
            "metadata": {"zone": "R-2", "category": "accessory", "section": "3"}
        },
        {
            "id": "clause_R2_4",
            "content": "ZONE R-2 CONVERSION REQUIREMENTS: Single-family to duplex conversion in Zone R-2 requires: (a) minimum lot size of 7,500 square feet, (b) 2 off-street parking spaces per unit, (c) no changes to exterior facades facing the street.",
            "metadata": {"zone": "R-2", "category": "conversion", "section": "4"}
        },
        
        # Zone C-1 - Neighborhood Commercial
        {
            "id": "clause_C1_1",
            "content": "ZONE C-1 - NEIGHBORHOOD COMMERCIAL: Zone C-1 is for small-scale commercial serving residential neighborhoods. Permitted uses include small retail, cafes, personal services, and professional offices under 5,000 square feet.",
            "metadata": {"zone": "C-1", "category": "general", "section": "1"}
        },
        {
            "id": "clause_C1_2",
            "content": "ZONE C-1 PARKING: All uses in Zone C-1 must provide parking at the following rates: Retail/Office - 1 space per 250 sq ft; Restaurant/Cafe - 1 space per 3 seats OR 1 space per 100 sq ft, whichever is greater; Personal services - 1 space per 200 sq ft.",
            "metadata": {"zone": "C-1", "category": "parking", "section": "2"}
        },
        
        # Heritage District Overlay
        {
            "id": "clause_HD_1",
            "content": "HERITAGE DISTRICT OVERLAY: Properties within the Heritage District are subject to additional architectural review. All exterior modifications visible from public rights-of-way require approval from the Historic Preservation Commission.",
            "metadata": {"zone": "Heritage", "category": "general", "section": "1"}
        },
        {
            "id": "clause_HD_2",
            "content": "HERITAGE DISTRICT SOLAR PANELS: Solar panel installations on buildings in the Heritage District are PROHIBITED on street-facing roof surfaces. Installations on rear-facing or non-visible surfaces may be approved case-by-case.",
            "metadata": {"zone": "Heritage", "category": "solar", "section": "2"}
        },
        {
            "id": "clause_HD_2_update",
            "content": "HERITAGE DISTRICT SOLAR (2024 AMENDMENT): To promote renewable energy, solar panels ARE NOW PERMITTED on Heritage District buildings provided they are (a) flat-mounted, (b) not visible from primary street frontage, (c) colored to match existing roof materials. This supersedes previous restrictions in section HD.2.",
            "metadata": {"zone": "Heritage", "category": "solar", "section": "2.1"}
        },
        
        # General Provisions
        {
            "id": "clause_GP_1",
            "content": "FENCE REQUIREMENTS: Front yard fences in all residential zones shall not exceed 4 feet in height. Side and rear yard fences may be up to 6 feet. Privacy fences over 4 feet in front yards are prohibited.",
            "metadata": {"zone": "General", "category": "fences", "section": "1"}
        },
        {
            "id": "clause_GP_2",
            "content": "VARIANCE PROCESS: Property owners may apply for variances from these regulations by submitting an application to the Zoning Board. Variances require demonstration of hardship and will be reviewed at public hearings held monthly.",
            "metadata": {"zone": "General", "category": "variance", "section": "2"}
        },
        {
            "id": "clause_GP_3",
            "content": "NON-CONFORMING USES: Existing uses that do not conform to current zoning may continue as legal non-conforming uses. Expansion of non-conforming uses is prohibited. If discontinued for 12 months, non-conforming status is lost.",
            "metadata": {"zone": "General", "category": "nonconforming", "section": "3"}
        },
        {
            "id": "clause_GP_4",
            "content": "ENVIRONMENTAL SETBACKS: All structures must maintain a 100-foot setback from wetlands, streams, and designated flood zones. This requirement supersedes zone-specific setbacks when applicable.",
            "metadata": {"zone": "General", "category": "environmental", "section": "4"}
        },
        
        # Additional clauses for complexity
        {
            "id": "clause_R1_5",
            "content": "ZONE R-1 SUBDIVISION: Lot subdivision in Zone R-1 requires approval from the Planning Commission. The original lot must be at least 20,000 square feet (approximately 0.46 acres) to be subdivided into two conforming lots.",
            "metadata": {"zone": "R-1", "category": "subdivision", "section": "5"}
        },
        {
            "id": "clause_B_5",
            "content": "ZONE B RESIDENTIAL DENSITY: Maximum residential density in Zone B is 20 units per acre for multi-family projects. Mixed-use developments may increase density to 25 units per acre with ground-floor retail.",
            "metadata": {"zone": "B", "category": "density", "section": "5"}
        }
    ]

