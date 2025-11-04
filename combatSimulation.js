// Roll a D6
function rollD6() {
    return Math.floor(Math.random() * 6) + 1;
}

// Calculate wound roll needed based on S vs T
function getWoundRoll(strength, toughness) {
    if (strength >= toughness * 2) return 2;
    if (strength > toughness) return 3;
    if (strength === toughness) return 4;
    if (strength * 2 <= toughness) return 6;
    return 5; // S < T
}

// Simulate a single attack sequence
function simulateSingleAttack(attacking, defending) {
    let hits = 0;
    let wounds = 0;
    let unsavedWounds = 0;
    let totalDamage = 0;

    // Roll to hit
    for (let i = 0; i < attacking.shots; i++) {
        const hitRoll = rollD6();
        if (hitRoll >= attacking.hitRoll) {
            hits++;
        }
    }

    // Roll to wound
    const woundRoll = getWoundRoll(attacking.strength, defending.toughness);
    for (let i = 0; i < hits; i++) {
        const roll = rollD6();
        if (roll >= woundRoll) {
            wounds++;
        }
    }

    // Roll saves
    const modifiedArmorSave = Math.min(7, defending.armorSave + attacking.armorPenetration);
    
    for (let i = 0; i < wounds; i++) {
        let saved = false;
        
        // Use the better save (invulnerable or modified armor)
        let saveNeeded;
        if (defending.invulnerableSave !== null) {
            saveNeeded = Math.min(modifiedArmorSave, defending.invulnerableSave);
        } else {
            saveNeeded = modifiedArmorSave;
        }
        
        // Roll save (7+ means no save possible)
        if (saveNeeded <= 6) {
            const saveRoll = rollD6();
            if (saveRoll >= saveNeeded) {
                saved = true;
            }
        }
        
        if (!saved) {
            unsavedWounds++;
            totalDamage += attacking.damage;
        }
    }

    return { damage: totalDamage, hits, wounds, unsaved: unsavedWounds };
}

// Run combat simulation
function runCombatSimulation(attacking, defending, simulations) {
    const damageDistribution = new Map();
    const modelsKilledDistribution = new Map();
    
    let totalDamage = 0;
    let totalHits = 0;
    let totalWounds = 0;
    let totalUnsaved = 0;

    for (let i = 0; i < simulations; i++) {
        const result = simulateSingleAttack(attacking, defending);
        
        totalDamage += result.damage;
        totalHits += result.hits;
        totalWounds += result.wounds;
        totalUnsaved += result.unsaved;
        
        // Track damage distribution
        const currentCount = damageDistribution.get(result.damage) || 0;
        damageDistribution.set(result.damage, currentCount + 1);
        
        // Calculate models killed
        const totalWoundsInUnit = defending.models * defending.woundsPerModel;
        const effectiveDamage = Math.min(result.damage, totalWoundsInUnit);
        const modelsKilled = Math.floor(effectiveDamage / defending.woundsPerModel);
        
        const modelsKilledCount = modelsKilledDistribution.get(modelsKilled) || 0;
        modelsKilledDistribution.set(modelsKilled, modelsKilledCount + 1);
    }

    const averageDamage = totalDamage / simulations;
    const totalWoundsInUnit = defending.models * defending.woundsPerModel;
    const effectiveAverageDamage = Math.min(averageDamage, totalWoundsInUnit);
    const averageModelsKilled = effectiveAverageDamage / defending.woundsPerModel;
    
    const hitRate = (totalHits / (attacking.shots * simulations)) * 100;
    const woundRate = totalHits > 0 ? (totalWounds / totalHits) * 100 : 0;
    const saveFailRate = totalWounds > 0 ? (totalUnsaved / totalWounds) * 100 : 0;

    return {
        averageDamage,
        averageModelsKilled,
        damageDistribution,
        modelsKilledDistribution,
        totalSimulations: simulations,
        hitRate,
        woundRate,
        saveFailRate,
    };
}

const imgToughness = document.getElementById("toughness");
// const defenderImage = document.getElementById("defenderImage");

// defenderImage.src = "Images/high quality images/spaceMarine.jpg"

imgToughness.addEventListener("change", function (event) {
    if (imgToughness.value === "4"){
        defenderImage.src = "Images/spaceMarine.webp"
        console.log(defenderImage)
    } else if (imgToughness.value === "5"){
        defenderImage.src = "Images/terminator.webp"
        console.log(defenderImage)
    } else if (imgToughness.value === "3"){
        defenderImage.src = "Images/imperialGuard.webp"
        console.log(defenderImage)
    }
    
    
    console.log(imgToughness.value);
  
});



// const options = {method: 'GET', headers: {'User-Agent': 'insomnia/11.6.2'}};

// fetch('https://api.disneyapi.dev/character', options)
//   .then(response => response.json())
//   .then(response => {
//     // console.log(response.data);

//     for (const charImg of response.data){
//         // console.log(charImg.imageUrl);

//         // const disneyChars = document.createElement("li");
//         // disneyChars.textContent = charImg.imageUrl

//         const imgLocation = document.getElementById("disneyTest");

//         // imgLocation.appendChild(disneyChars);

//         const disneyImg = document.createElement("img");
//         // disneyImg.textContent = "src=" + charImg.imageUrl + " alt='placeholder'"
//         disneyImg.src = charImg.imageUrl
//         disneyImg.alt = charImg.name

//         const disneyImgName = document.createElement("div");
//         disneyImgName.textContent = charImg.name

//         imgLocation.appendChild(disneyImg);
//         imgLocation.appendChild(disneyImgName);




//         //instead, create an img element with the url text in the link section
//         //maybe in future add the name to the alt text
//     }

// })

//   .catch(err => console.error(err));


addTaskBtn.addEventListener("click", retrieveChar);

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    retrieveChar();
  }
});

const inputBox = document.getElementById("taskInput")

function retrieveChar() {
    console.log(inputBox.value)
        // take the output of the search bar
         // edit the api link with the name appended
    fetch('https://api.disneyapi.dev/character' + '?name=' + inputBox.value, options)
  .then(response => response.json())
  .then(response => {

    //print the image and name of that character
    //if no name exists return error message


        const searchBarOutput = document.getElementById("searchBarOutput");
 

        for (const charImg of response.data){
        // console.log(charImg.imageUrl);

        // const disneyChars = document.createElement("li");
        // disneyChars.textContent = charImg.imageUrl

        const imgLocation = document.getElementById("disneyTest");

        // imgLocation.appendChild(disneyChars);

        const disneyImg = document.createElement("img");
        // disneyImg.textContent = "src=" + charImg.imageUrl + " alt='placeholder'"
        disneyImg.src = charImg.imageUrl
        disneyImg.alt = charImg.name

        const disneyImgName = document.createElement("div");
        disneyImgName.textContent = charImg.name

        imgLocation.appendChild(disneyImg);
        imgLocation.appendChild(disneyImgName);




        //instead, create an img element with the url text in the link section
        //maybe in future add the name to the alt text
    }
    }
)
}

let allUnits = [];

const options = { method: 'GET', headers: { 'User-Agent': 'insomnia/11.6.2' } };

// Fetch unit list and store it for search
fetch('http://localhost:3000/units', options)
  .then(response => response.json())
  .then(response => {
    allUnits = response;
    console.log("Loaded units:", allUnits.length);
  })
  .catch(err => console.error(err));

// Elements
const defenderSearch = document.getElementById("defenderSearch");
const searchDefenderBtn = document.getElementById("searchDefenderBtn");
const defenderResults = document.getElementById("defenderResults");
const defenderImage = document.getElementById("defenderImage");

// Stat inputs
const toughnessInput = document.getElementById("toughness");
const woundsInput = document.getElementById("wounds");
const armorSaveSelect = document.getElementById("armorSave");
const invulnSaveSelect = document.getElementById("invulnSave");

searchDefenderBtn.addEventListener("click", searchDefender);
defenderSearch.addEventListener("keydown", e => {
  if (e.key === "Enter") searchDefender();
});

// Search and display matching units
function searchDefender() {
  const query = defenderSearch.value.trim().toLowerCase();
  defenderResults.innerHTML = "";

  if (!query) return;

  const matches = allUnits.filter(unit =>
    unit.name.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    defenderResults.innerHTML = `<p class="text-secondary">No matching units found.</p>`;
    return;
  }

  matches.forEach(unit => {
    const card = document.createElement("div");
    card.classList.add("text-center");
    card.style.cursor = "pointer";
    card.style.width = "100px";

    const img = document.createElement("img");
    img.src = unit.image_url;
    img.alt = unit.name;
    img.classList.add("img-thumbnail");
    img.style.height = "100px";
    img.style.objectFit = "cover";

    const name = document.createElement("div");
    name.classList.add("small", "mt-1");
    name.textContent = unit.name;

    card.appendChild(img);
    card.appendChild(name);

    // When a unit is clicked, set the image and auto-fill stats
    card.addEventListener("click", () => selectDefendingUnit(unit));

    defenderResults.appendChild(card);
  });
}

// Auto-fill defender info
function selectDefendingUnit(unit) {
  // Update the preview image
  defenderImage.src = unit.image_url;
  defenderImage.alt = unit.name;

  // Auto-fill stats
  toughnessInput.value = unit.toughness ?? toughnessInput.value;
  woundsInput.value = unit.wounds ?? woundsInput.value;

  // Save
  if (unit.save) {
    // find matching <option> in the select
    for (let opt of armorSaveSelect.options) {
      if (opt.value == unit.save) {
        armorSaveSelect.value = opt.value;
        break;
      }
    }
  }

  // Invulnerable Save (optional)
  if (unit.invuln_save) {
    invulnSaveSelect.value = unit.invuln_save;
  } else {
    invulnSaveSelect.value = "none";
  }

  // Feedback in console
  console.log(`Selected ${unit.name}`);
  console.table(unit);
}