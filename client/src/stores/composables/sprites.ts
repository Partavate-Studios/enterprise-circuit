import { Sprite, Orbit, Coords } from '../../models/sprite'

const maxPlanets = 14
const planetDistance = 500
const planetGap = 480

const maxMoons = 8
const moonDistance = 65
const moonGap = 30

const stationDistance = 40
const shipDistance = 12

export function useSprites(chainData: any) {
	let sprites: Sprite[] = []

	sprites[0] = new Sprite({
		index: 0,
		type: 'Star',
		id: chainData.systemData.id,
		name: chainData.systemData.name,
		size: chainData.systemData.starSize,
		owner: chainData.systemData.discoveredBy,
	})

	chainData.localPlanets.forEach((planet: any) => {
		sprites.push(
			new Sprite({
				type: 'Planet',
				id: planet.id,
				name: planet.name,
				size: planet.size,
				class: planet.class,
				rings: planet.rings,
				orbit: planet.orbit,
				velocity: planet.velocity,
				owner: planet.owner,
			}),
		)

		let planetIndex = sprites.length - 1
		sprites[planetIndex].setIndex(planetIndex)

		planet.moons.forEach((moon: any) => {
			sprites.push(
				new Sprite({
					type: 'Moon',
					id: planet.id,
					name: moon.name,
					size: moon.size,
					class: moon.class,
					parent: planetIndex,
					orbit: moon.orbit,
					velocity: moon.velocity,
					owner: planet.owner,
				}),
			)
			let moonIndex = sprites.length - 1
			sprites[moonIndex].setIndex(moonIndex)
		})

		if (planet.hasPort) {
			sprites.push(
				new Sprite({
					type: 'Station',
					id: planet.id,
					name: planet.station.name,
					size: planet.station.size,
					inventory: planet.station.inventory,
					price: planet.station.price,
					parent: planetIndex,
					owner: planet.owner,
				}),
			)
			let stationIndex = sprites.length - 1
			sprites[stationIndex].setIndex(stationIndex)
		}
	})

	chainData.ships.forEach((ship: any) => {
		sprites.push(
			new Sprite({
				type: 'Ship',
				id: ship.id,
				name: ship.name,
				owner: ship.owner,
				parent: planetIndexFromId(ship.orbit),
			}),
		)
		let shipIndex = sprites.length - 1
		sprites[shipIndex].setIndex(shipIndex)
	})

	function planetIndexFromId(id: string) {
		let index = 0
		for (let i = 0; i < sprites.length; i++) {
			if (
				BigInt(sprites[i].meta.id) == BigInt(id) &&
				(sprites[i].type == 'Planet' || sprites[i].type == 'Star')
			) {
				index = i
			}
		}
		return index
	}

	function setOrbitalData(id: number) {
		let sprite = sprites[id]
		switch (sprite.type) {
			case 'Planet': {
				sprite.orbit.distance = sprite.orbit.position * planetGap + planetDistance
				sprite.orbit.period = sprite.orbit.velocity / (sprite.orbit.position + 1) + 5
				sprite.luminance.intensity = 0.7 - ((sprite.orbit.position / maxPlanets) * 2) / 3
				break
			}
			case 'Moon': {
				sprite.orbit.distance = sprite.orbit.position * moonGap + moonDistance
				sprite.orbit.distance += sprites[sprite.orbit.parent].meta.size * 1.5
				sprite.orbit.period = (sprite.orbit.velocity * 4) / (sprite.orbit.position + 1) + 100
				break
			}
			case 'Station': {
				sprite.orbit.distance = stationDistance + sprites[sprite.orbit.parent].meta.size * 1.5
				sprite.orbit.period = (50 - sprites[sprite.orbit.parent].meta.size) * 10 + 150 + id * 10
				break
			}
			case 'Ship': {
				if (sprite.orbit.parent == 0) {
					sprite.orbit.distance = planetGap / 2
				} else {
					sprite.orbit.distance = shipDistance + sprites[sprite.orbit.parent].meta.size * 1.5
				}
				sprite.orbit.period = 1000
				break
			}
		}
	}

	for (let i = 0; i < sprites.length; i++) {
		setOrbitalData(i)
	}

	return sprites
}
