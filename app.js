// Chart instances
let damageChart = null;
let modelsChart = null;

// Get form values
function getAttackingUnit() {
    return {
        shots: parseInt(document.getElementById('shots').value) || 1,
        hitRoll: parseInt(document.getElementById('hitRoll').value) || 4,
        strength: parseInt(document.getElementById('strength').value) || 4,
        armorPenetration: parseInt(document.getElementById('ap').value) || 0,
        damage: parseInt(document.getElementById('damage').value) || 1,
    };
}

function getDefendingUnit() {
    const invulnValue = document.getElementById('invulnSave').value;
    return {
        models: parseInt(document.getElementById('models').value) || 1,
        toughness: parseInt(document.getElementById('toughness').value) || 4,
        armorSave: parseInt(document.getElementById('armorSave').value) || 4,
        invulnerableSave: invulnValue === 'none' ? null : parseInt(invulnValue),
        woundsPerModel: parseInt(document.getElementById('wounds').value) || 1,
    };
}

// Update results display
function displayResults(results, attackingUnit, defendingUnit) {
    // Show results section
    document.getElementById('resultsSection').style.display = 'block';
    
    // Update simulation count
    document.getElementById('simulationCount').textContent = 
        `Based on ${results.totalSimulations.toLocaleString()} simulations`;
    
    // Update metrics
    document.getElementById('avgDamage').textContent = results.averageDamage.toFixed(2);
    document.getElementById('modelsKilled').textContent = results.averageModelsKilled.toFixed(2);
    document.getElementById('hitRate').textContent = results.hitRate.toFixed(1) + '%';
    document.getElementById('saveFailRate').textContent = results.saveFailRate.toFixed(1) + '%';
    
    // Calculate probabilities
    const killAllProbability = ((results.modelsKilledDistribution.get(defendingUnit.models) || 0) / results.totalSimulations) * 100;
    
    let anyDamageProbability = 0;
    for (const [damage, count] of results.damageDistribution.entries()) {
        if (damage > 0) {
            anyDamageProbability += count;
        }
    }
    anyDamageProbability = (anyDamageProbability / results.totalSimulations) * 100;
    
    // Update probabilities
    document.getElementById('anyDamageBadge').textContent = anyDamageProbability.toFixed(1) + '%';
    document.getElementById('anyDamageProgress').style.width = anyDamageProbability + '%';
    
    document.getElementById('killAllLabel').textContent = `Kill entire unit (${defendingUnit.models} models)`;
    document.getElementById('killAllBadge').textContent = killAllProbability.toFixed(1) + '%';
    document.getElementById('killAllProgress').style.width = killAllProbability + '%';
    
    const survivesProbability = 100 - killAllProbability;
    document.getElementById('survivesBadge').textContent = survivesProbability.toFixed(1) + '%';
    document.getElementById('survivesProgress').style.width = survivesProbability + '%';
    
    // Update charts
    updateCharts(results);
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Update charts
function updateCharts(results) {
    // Prepare damage distribution data
    const damageData = [];
    for (const [damage, count] of results.damageDistribution.entries()) {
        damageData.push({
            damage,
            probability: (count / results.totalSimulations) * 100
        });
    }
    damageData.sort((a, b) => a.damage - b.damage);
    
    // Prepare models killed distribution data
    const modelsData = [];
    for (const [models, count] of results.modelsKilledDistribution.entries()) {
        modelsData.push({
            models,
            probability: (count / results.totalSimulations) * 100
        });
    }
    modelsData.sort((a, b) => a.models - b.models);
    
    // Destroy existing charts
    if (damageChart) {
        damageChart.destroy();
    }
    if (modelsChart) {
        modelsChart.destroy();
    }
    
    // Create damage chart
    const damageCtx = document.getElementById('damageChart').getContext('2d');
    damageChart = new Chart(damageCtx, {
        type: 'bar',
        data: {
            labels: damageData.map(d => d.damage),
            datasets: [{
                label: 'Probability (%)',
                data: damageData.map(d => d.probability),
                backgroundColor: '#ef4444',
                borderColor: '#dc2626',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Probability: ' + context.parsed.y.toFixed(2) + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Damage',
                        color: '#cbd5e1'
                    },
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: '#475569'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Probability (%)',
                        color: '#cbd5e1'
                    },
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: '#475569'
                    }
                }
            }
        }
    });
    
    // Create models chart
    const modelsCtx = document.getElementById('modelsChart').getContext('2d');
    modelsChart = new Chart(modelsCtx, {
        type: 'bar',
        data: {
            labels: modelsData.map(d => d.models),
            datasets: [{
                label: 'Probability (%)',
                data: modelsData.map(d => d.probability),
                backgroundColor: '#f97316',
                borderColor: '#ea580c',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Probability: ' + context.parsed.y.toFixed(2) + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Models Killed',
                        color: '#cbd5e1'
                    },
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: '#475569'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Probability (%)',
                        color: '#cbd5e1'
                    },
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: '#475569'
                    }
                }
            }
        }
    });
}

// Run simulation
function handleRunSimulation() {
    const button = document.getElementById('runSimulation');
    const buttonText = button.querySelector('span');
    const originalText = buttonText.textContent;
    
    // Disable button and show loading state
    button.disabled = true;
    buttonText.textContent = 'Running Simulation...';
    
    // Get form values
    const attackingUnit = getAttackingUnit();
    const defendingUnit = getDefendingUnit();
    const simulations = parseInt(document.getElementById('simulations').value) || 1000;
    
    // Run simulation in a timeout to allow UI to update
    setTimeout(() => {
        const results = runCombatSimulation(attackingUnit, defendingUnit, simulations);
        displayResults(results, attackingUnit, defendingUnit);
        
        // Re-enable button
        button.disabled = false;
        buttonText.textContent = originalText;
    }, 100);
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('runSimulation').addEventListener('click', handleRunSimulation);
    
    // Allow Enter key to run simulation
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleRunSimulation();
            }
        });
    });
});