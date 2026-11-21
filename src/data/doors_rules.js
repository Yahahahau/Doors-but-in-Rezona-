/**
 * doors_rules.js — DOORS (Roblox) → "DOORS but in Rezona" rules & formulas
 * ---------------------------------------------------------------------------
 * ที่มา: DOORS Wiki (doors-game.fandom.com) — ดูรายละเอียด/ลิงก์ใน DOORS_Research_Phase01.md
 * เวอร์ชันข้อมูล: หลัง Mines Update (30 ส.ค. 2024) / Outdoors Update (10 ส.ค. 2025)
 *
 * กติกาของไฟล์นี้ (สำคัญ):
 *  - ทุกค่าที่มี `src: 'wiki'`  = มาจาก DOORS Wiki ตรง ๆ
 *  - `src: 'wiki-conflict'`     = wiki ขัดแย้งกันเอง → ใส่ค่าที่เลือก + `alt` (อีกค่า) ให้เลือกเอง
 *  - `src: 'secondary'`         = แหล่งรอง (บล็อก/เว็บไกด์) ใช้ตรวจไขว้เท่านั้น
 *  - `null` + `tunable: true`   = wiki "ไม่ระบุตัวเลข" → ต้องตั้งค่าเองตอนพัฒนา (อย่าเดาว่าเป็นค่าต้นฉบับ)
 *  - ค่าใน `TWO_D` = ค่าที่ "ผู้พัฒนา 2D ต้องกำหนด" ไม่ใช่ค่าจากเกมต้นฉบับ
 *
 * ใช้งาน (browser, ES module):
 *   import { RULES, F } from './doors_rules.js';
 *   F.goldToKnobs(1234)  // → 62
 * หน่วย `studs` = หน่วย Roblox ต้นฉบับ — ต้องแปลงเป็น px เองด้วย TWO_D.pxPerStud
 */

const W = 'wiki';
const C = 'wiki-conflict';
const S = 'secondary';

export const RULES = {
  meta: {
    version: 'phase01-2026-11-21',
    scope: 'The Hotel, Door 0-100',
    notes: 'null = wiki ไม่ระบุ (ต้องตั้งเอง). ดู TWO_D สำหรับค่าที่ต้องกำหนดสำหรับ 2D',
  },

  // ------------------------------------------------------------------ PLAYER
  player: {
    maxHp: { value: 100, src: W },
    passiveRegen: { value: false, src: W, note: 'ไม่ฟื้นเลือดเอง ยกเว้น Green Herb' },
    reviveWindowSec: { value: 30, src: W },
    revivesPerRun: { value: 1, src: W },
    reviveKeptIfDiesWithinSec: { value: 20, src: W },
    reviveBlockedWhile: { value: ['rush', 'ambush', 'seek'], src: W },
    reviveBlockedAfter: { value: ['greenhouse_first_door', 'electrical_room'], src: W },
    freeAutoReviveBeforeFirstDoor: { value: true, src: W },
    elevatorMaxPlayersAnimated: { value: 4, src: W },
  },

  // ------------------------------------------------------------------ ECONOMY
  economy: {
    goldValues: { value: { coin: 5, coinPile4: 10, bar1_coin3: 25, bar2: 50, bar3_coin2: 75, jackpot: 100 }, src: W },
    goldPerKnob: { value: 20, src: W },
    knobRoundUpRemainderAtLeast: { value: 10, src: W },
    knobCap: { value: 500, src: W },
    jeffShop: {
      slotsSold: { value: 4, src: W, note: 'ขาย 4 ชิ้นจากพูล 6 ชิ้น' },
      pool: ['lighter', 'vitamins', 'lockpick', 'flashlight', 'skeleton_key', 'crucifix'],
      guaranteed: ['skeleton_key'],
      crucifixSaleChance: { value: 0.6, src: S, note: 'แหล่งรอง 60%' },
      pricesGold: {
        lighter: 100, vitamins: 100, lockpick: 100, flashlight: 200, skeleton_key: 300, crucifix: 500,
      },
      pricesSrc: S,
      altPrices: { crucifix_old: 250, lockpick_alt: 250 },
      altNote: 'Crucifix 250 = ค่าเก่า (ก่อน Super Hard Mode); Lockpick 250 มาจากบล็อกเดียว ไม่เชื่อถือ',
      closedIfRushOrAmbushSpawns: { value: true, src: W },
      tipJar: { donationPerClickGold: 10, maxDonationGold: 100, src: S },
    },
    preRunShopKnobs: {
      value: { vitamins_x3: 100, lockpick_x2: 50, lighter: 50, flashlight: 100 },
      src: S,
      note: 'ตีความจาก shop table; ความมั่นใจปานกลาง',
    },
  },

  // ------------------------------------------------------------------- ITEMS
  items: {
    flashlight: {
      maxUseSec: { value: 120, src: W },
      batteryAddsFraction: { value: 0.5, src: W },
      batteryAddsSec: { value: 60, src: W },
      overchargeMaxFraction: { value: 1.1, src: W },
      makesNoiseForFigure: { value: true, src: W },
      flickerWhenLowOrWet: { value: true, src: W },
    },
    lighter: {
      maxUseSec: { value: 60, src: W },
      fuelBars: { value: 3, src: W, alt: 4, altNote: 'ก่อน Hunt update = 4' },
      clicksToLightBar: { value: 'bar n needs n clicks', src: W },
      foundFuelRange: { value: [0.5, 1.0], src: W },
      makesNoiseForFigure: { value: true, src: W },
    },
    vitamins: {
      boostSec: { value: 8, src: W },
      cooldownAfterEffectSec: { value: 5, src: W },
      stacksWithSeekChaseBoost: { value: true, src: W },
      boostMultiplier: { value: null, tunable: true, note: 'wiki ไม่ระบุตัวเลข' },
      maxStack: { value: 3, src: C, alt: 5, altNote: 'หน้า Vitamins = 3; rblxguide(🔸) = 5' },
      healsHp: { value: 0, src: W, note: 'ถอดผลฟื้นเลือดตั้งแต่ Hotel+' },
    },
    lockpick: { maxStack: { value: 3, src: S } },
    skeletonKey: { uses: { value: 5, src: S }, opens: ['skull_doors', 'locked_chests', 'rooms_entrance'] },
    crucifix: {
      maxStack: { value: 1, src: S },
      singleUse: { value: true, src: S },
      banishes: { value: ['rush', 'ambush', 'eyes', 'screech', 'halt', 'hide', 'sally', 'dread', 'dupe', 'void'], src: 'wiki+secondary' },
      stunsOnly: { value: ['seek', 'figure'], src: W, note: '+ Grumble (Mines). Seek/Figure/Grumble หนี Crucifix ได้' },
      stunDurationSec: { value: null, tunable: true, note: '"หลายวินาที" ไม่ระบุตัวเลข' },
      screechSuppressSec: { value: 300, src: W },
      hideDisabledSec: { value: 60, src: W },
    },
    alarmClock: { tickSecBeforeRing: { value: 10, src: W }, destroyedByFigureAfterInvestigating: { value: true, src: W } },
    greenHerb: { effect: 'passive_regen', regenRatePerSec: { value: null, tunable: true } },
    breakerSwitch: { countInRoom100: { value: 10, src: W }, isInventoryItem: { value: false, src: W } },
    painting: { returnToWallAfterSec: { value: 20, src: W } },
  },

  // --------------------------------------------------------------- DAMAGE TABLE
  damage: {
    rush: { value: 125, src: W },
    ambush: { value: 100, src: W },
    halt: { value: 60, src: W },
    screech: { value: 40, src: W },
    hideKickOut: { value: 40, src: W },
    dupe: { value: 40, src: W },
    seekChandelier: { value: 45, src: W },
    snare: { value: 20, src: C, alt: 10, altNote: 'หน้า Snare = 20; หน้า Greenhouse = 10 และไม่ลดต่ำกว่า 1' },
    eyesPerTick: { value: [3, 10], src: W, note: 'แรงขึ้นเมื่ออยู่ใกล้กลางจอ' },
    timothy: { value: 5, src: W, note: 'HP ≤5 → เหลือ 1-4; ฆ่าไม่ได้ (ยกเว้น modifier Itchy = 10)' },
    voidRandom: { value: [10, 40], src: W, note: 'ช่วง 10-40 เป็นค่าเดิมของ Glitch ที่ Void รับช่วง' },
    instantKill: ['figure', 'seek', 'seekArms', 'dread'],
    zeroDamage: ['jack', 'shadow', 'glitch'],
  },

  // ----------------------------------------------------------------- ENTITIES
  entities: {
    rush: {
      speedStudsPerSec: { value: 65, src: W },
      speedStudsPerSecRunnin: { value: 80, src: W },
      doorRange: { value: [3, 97], src: C, alt: 2, altNote: 'Behavior บอกเริ่มที่ Door 2' },
      usuallyFirstAppearsAt: { value: [10, 15], src: W },
      spawnsPerSegment: {
        value: { receptionToSeek1: [2, 4], seek1ToJeff: [0, 2], jeffToSeek2: [2, 3], seek2ToGreenhouse: [1, 2], greenhouse: [2, 3] },
        src: W,
      },
      greenhouseChancePerRoom: { value: 0.2, src: C, note: 'หน้า Rush = 1/5; หน้า Greenhouse ไม่ยืนยัน' },
      guaranteedPerRun: { value: true, src: W },
      lightsFlickerSec: { value: 2, src: W },
      maxDoorsFromSpawnBeforeStopping: { value: 4, src: W },
      cannotOpen: ['locked_door', 'door_98', 'door_99', 'door_100'],
      effects: ['shatter_lights', 'opens_next_unopened_door', 'despawns_after'],
      detection: 'raycast_line_of_sight',
      spawnChancePerDoor: { value: null, tunable: true, note: 'wiki ไม่ระบุ % (บอกแค่ว่าเพิ่มตามความลึก)' },
      audioHearableRooms: { value: 2, src: W },
      slowerWithMorePlayers: { value: true, src: W },
    },
    ambush: {
      speed: { value: 'same_as_rush', src: C, note: 'Trivia ยังบอกเร็วสุด ⚠' },
      doorRange: { value: [3, 99], src: C, alt: 88, altNote: 'Strategy section บอกสูงสุด 88' },
      mostCommonDoor: { value: 82, src: W },
      expectedWindow: { value: [82, 88], src: W },
      reboundCount: { value: [2, 4], src: W, altOld: 6, altTriviaMax: 16 },
      spawnsPerRun: { value: [0, 4], typical: 1, src: W },
      spawnChanceRef: { value: 0.0666, src: S, note: 'trivia — เพิ่มตามความลึก' },
      cannotSpawnIn: ['greenhouse', 'rooms_without_hiding_spots'],
      despawnedByEnteringHaltHallway: { value: true, src: W },
      detection: 'raycast_line_of_sight',
    },
    seek: {
      crescendo: { value: { startDoorMin: 25, rooms: [2, 5] }, src: W },
      chase1: { value: { startDoor: [29, 42], rooms: 6 }, src: C, alt: { startDoor: [30, 40], rooms: 5 } },
      chase2: { value: { startDoor: [69, 75], rooms: 6 }, src: C, alt: { startDoor: [70, 80], rooms: 6 } },
      notGuaranteed: { value: true, note: 'โอกาสไม่เกิดต่ำมาก', src: W },
      finalRoom: { arms: 'instant_kill_on_touch', chandeliers: { count: 3, damage: 45 }, exitDoorBangs: 3 },
      crucifix: 'stun_only',
      speedStudsPerSec: { value: null, tunable: true, note: 'wiki ไม่ระบุ; ผู้เล่นได้บูสต์ทำให้ Seek ช้ากว่าปริยาย' },
      itCanRunTooBonusKnobs: { value: 0.05, src: W },
      killsThroughWalls: { value: true, src: W },
      killsHidingPlayers: { value: true, src: W },
      reviveBlockedUntilChaseEnds: { value: true, src: W },
    },
    figure: {
      heightFt: { value: 7, src: W },
      detection: 'sound',
      library: {
        booksTotal: { value: 8, src: W },
        booksNeededForCode: { value: 5, src: W },
        superHard: { booksTotal: 15, booksNeeded: 10 },
        speedPerBookMultiplier: { value: 0.75, src: C, note: 'wiki เขียนคลุมเครือ — ต้องตีความ/ทดสอบ' },
        outrunnableIfBooksBelow: { value: 3, src: W, note: 'หลัง Mines update วิ่งหนีไม่ทันแม้เก็บ 3 เล่ม' },
        lampDistractFirst: true,
      },
      electricalRoom: {
        heartbeatDetection: true,
        lightSourcesAggravate: ['flashlight', 'shakelight', 'straplight', 'bulklight'],
        stunnedByHolyHandGrenade: false,
      },
      killOnTouch: true,
      killsPlayersInClosetWhenSearching: true,
      walkSpeedStudsPerSec: { value: null, tunable: true },
      runSpeedStudsPerSec: { value: null, tunable: true },
      hearingRange: { value: null, tunable: true },
      noiseLoudnessPriority: 'nearest_loud_wins_over_far_louder',
      crucifix: 'stun_only',
      alarmClockCanDistract: true,
    },
    screech: {
      damage: 40,
      spawnsOnlyIn: 'dark_rooms',
      spawnsBehindPlayer: true,
      excludedDuring: ['seek_chase', 'halt_hallway', 'electrical_room_mines'],
      lookAtToDispel: true,
      lookWindowSec: { value: null, tunable: true, note: '"ไม่กี่วินาที" ไม่ระบุ' },
      spawnChance: { value: null, tunable: true },
      crucifixSuppressSec: 300,
      hidingDespawns: true,
      lowerChanceWith: ['light_source', 'guiding_light', 'more_players'],
    },
    halt: {
      damage: 60,
      room: 'dining_hall',
      doorRange: { value: [1, 87], src: W },
      spawnChance: { value: [0.001, 0.005], src: W, note: 'หลัง Hotel+ (เดิม 3%); ช่วงหลัง Seek#2 สูงกว่า' },
      guaranteedPerRun: { value: false, src: C, note: 'ยกเลิกการรับประกันเมื่อ 10 ส.ค. 2025 (หน้า Dining Hall ยังเขียนว่ารับประกัน)' },
      maxPerRun: 1,
      cycle: ['spawn_behind', 'approach', 'teleport_in_front', 'repeat_until_exit'],
      warning: { symbol: 'turn_around', textProximity: 'RUN AWAY' },
      entranceClosesImmediately: true,
      despawnsRushAndAmbush: true,
      damageIfHitAfterExitDoorOpened: 0,
      speedScalesWithProgressToExit: true,
      speedStudsPerSec: { value: null, tunable: true },
      crucifix: 'forced_out_of_room',
    },
    eyes: {
      baseChancePerDoor: { value: 0.03, src: W },
      doorRange: { value: [5, 98], src: W },
      damageByScreenPosition: { value: [3, 10], src: W, note: 'ใกล้กลางจอแรงกว่า' },
      noSpawnIn: ['reception', 'library', 'electrical_room', 'seek_crescendo'],
      despawnOnNextDoor: true,
      immuneWhen: ['hiding', 'climbing_ladder', 'cutscene', 'screech_nearby', 'snare_trapped', 'dupe_attacking'],
      emitsLightInDarkRooms: true,
      counter: 'look_away_or_down',
    },
    hide: {
      kickOutSec: { value: 12, src: W },
      kickOutSecRentsDue: { value: [5, 6], src: W },
      damage: 40,
      cooldownAfterKickSec: { value: 10, src: W },
      crucifixDisableSec: 60,
      absentIn: ['retro_mode', 'the_rooms', 'the_backdoor', 'the_outdoors', 'electrical_room_closets'],
      figureHeartbeatMinigame: { keys: ['Q', 'E'], failsToKickOut: 2 },
      startsImmediatelyInFigureRooms: { value: true, except: 'electrical_room', src: W },
    },
    jack: {
      closetChancePerHideAttempt: { value: 0.005, src: W, alt: 0.05, altNote: 'บรรทัด "5%" ของ Hotel ไม่ชัดเจน' },
      hallwayChancePerNewRoom: { value: 0.0005, src: W },
      damage: 0,
      noSpawnIn: ['reception', 'adit'],
      blocksHiding: true,
      inactiveDuring: ['rush_attack', 'ambush_attack'],
      bloodRoomChance: { value: 1 / 2000, src: W },
    },
    dupe: {
      damage: 40,
      maxFakeDoorsPerRoom: { value: 8, src: W },
      earliestDoor: { value: 2, src: W },
      noSpawnIn: ['library', 'jeff_shop', 'basement', 'reception', 'dining_hall', 'courtyard'],
      cues: ['wrong_or_duplicate_number', 'rumble_when_close', 'light_or_sound_behind_real_door', 'plate_falls_in_dark_rooms'],
      rushAlwaysUsesRealDoor: true,
      crucifix: 'stops_attack_closes_door',
      afterDoor50: 'plate_may_not_fall_rumble_louder',
      scrambleAfterSec: { value: null, tunable: true, note: 'สั้นลงตามความลึก; ไม่ระบุตัวเลข' },
    },
    timothy: {
      chancePerContainer: { value: 0.005, src: W },
      damage: 5,
      canSpawnTwiceInSameContainer: true,
      lethal: false,
    },
    snare: {
      damage: 20,
      holes: 19,
      countPerGreenhouseRoom: { value: [1, 3], src: W },
      immobilizeSec: { value: null, tunable: true, note: '"ไม่กี่วินาที"' },
      unequipsHeldItem: true,
      spawnsIn: ['greenhouse', 'courtyard'],
      noSpawnIn: ['reception', 'seek_chase'],
    },
    void: {
      role: 'return_lagging_player',
      warnAtRoomsBehind: { value: 5, src: W },
      warnAtRoomsBehindAfterInfirmary: { value: 4, src: W },
      warnAtRoomsBehindAfterSeek2: { value: 3, src: W },
      sequence: ['close_exit_door', 'dim_room', 'teleport_flash', 'random_damage'],
      crucifixPreventsDamageNotTeleport: true,
    },
    glitch: {
      canonical: false,
      damage: 0,
      roomsBehindTrigger: { theRooms: 7, theBackdoor: 4 },
      note: 'failsafe ของ engine — ไม่ต้องทำใน 2D (ดู 2D adaptation)',
    },
    dread: {
      triggerClockHour: 12,
      resetClockHourOnDoorOpen: 11,
      realMinutesPerGameHour: { value: 10, src: W },
      realMinutesPerGameHourInBigEncounterRooms: { value: 60, src: W },
      secondHandRotationSec: { value: 7, afterDoor50: 5, src: W },
      killOnTouch: true,
      chaseMusicSec: { value: 120, src: W },
      despawnOnNextDoorOpened: true,
      speed: { value: 'slow', studsPerSec: null, tunable: true },
      killsDuringCrucifyIfNoCrucifix: true,
    },
    shadow: { chancePerDoor: { value: 1 / 2000, src: W }, damage: 0, noSpawnIn: ['door_99', 'electrical_room'] },
    sally: {
      spawnRequires: { value: 'at least 1 player has 3 major items', src: W },
      doorRange: { value: [1, 98], src: W },
      hpAfter: 'max(3, hp/3)',
      maxHpAfter: 'max(50, maxHp/1.3)',
      oxygenSetTo: 0.05,
      playWithItemSec: { value: 15, src: W },
      ignoresItems: ['minor_items', 'glowstick_thrown', 'alarm_clock_placed'],
      ignoresWalls: true,
      cannotKill: true,
      crucifix: 'crucify',
      spawnChance: { value: null, tunable: true },
    },
    guidingLight: {
      highlightAfterSec: { value: [20, 70], src: W },
      darkRoomHighlightsNextDoor: true,
      closesDoorsAfter: ['seek_chase', 'library', 'figure_room'],
      keySoundCue: true,
      disabledByModifier: ['gone_fishing'],
    },
  },

  // -------------------------------------------------------- HIDING / LOCKS
  hiding: {
    spots: {
      wardrobe: { capacity: 1, protectsFrom: 'most', failsAgainst: ['hide'] },
      bedSinglePillow: { capacity: 1, doors: [1, 88] },
      bedDoublePillow: { capacity: 3 },
      toolshed: { capacity: 1, where: ['courtyard', 'greenhouse', 'electrical_room'] },
    },
    entryAnimationImmune: true,
    exitAnimationVulnerableTo: ['rush', 'ambush'],
    bedAnimationLongerThanCloset: true,
    seekKillsHidingPlayer: true,
    roomOfClosetsCount: { value: 12, src: W },
    ambushAvoid: 'closets_and_beds_facing_previous_room (large hitbox)',
  },
  locks: {
    roomKeyOpensOnlyItsDoor: true,
    keyDisappearsAfterUse: true,
    receptionKeyLabel: '0001',
    guidingLightKeyHighlight: 'sound_then_highlight_after_time',
    holdItemWhileUsingKey: true,
    lockpickOpens: ['locked_doors', 'locked_chests'],
    electricalRoomKeyOpens: 'circuit_breaker_room_only',
    lockpickWorksOnBreakerRoomSinceHotelPlus: true,
  },

  // -------------------------------------------------------- ROOM GENERATION
  rooms: {
    fixed: {
      0: 'reception',
      50: 'library',
      61: 'basement',
      100: 'electrical_room',
    },
    ranges: {
      diningHall: { value: [3, 89], src: C, alt: [1, 87] },
      seekChase1: { value: [29, 42], src: C, alt: [30, 40] },
      preLibrary: 49,
      jeffShop: { value: 52, src: C, alt: [53, 59] },
      theRoomsEntrance: 60,
      preInfirmary: [65, 69],
      infirmary: { value: [66, 70], src: C },
      seekChase2: { value: [69, 75], src: C, alt: [70, 80] },
      lounge: { value: [70, 88], note: 'มักเกิด แต่เกิดเมื่อไรก็ได้' },
      ambushUsual: 82,
      preCourtyard: 88,
      courtyard: 89,
      greenhouse: [90, 98],
      electricalEntrance: 99,
    },
    earliest: {
      darkRoom: 9,
      smallBasement: 5,
      ruinedRoom: 53,
      meetingRoom: 10,
      lShapedLocked: 1,
      longCorridor8Rooms: 4,
      plusJunction4Rooms: 5,
      windowSuite: 10,
      tJunctionBlocked: 18,
    },
    chances: {
      meetingRoom: { value: 0.02, src: W, maxPerRun: 1 },
      bloodRoom: { value: 1 / 2000, src: W },
      smallBasementsGuaranteedPerRun: { value: 2, src: W },
      grandHallwayMinPerRun: { value: 3, src: W },
    },
    neverDark: ['library_entrance', 'immediately_after_seek_chase_2'],
    alwaysDark: ['basement', 'greenhouse'],
    safeZones: ['reception', 'jeff_shop', 'courtyard (Eyes possible)', 'door_49 (unless Rush earlier)'],
    note: 'ห้องส่วนใหญ่สุ่ม — ไม่มีตารางรายประตู 1-100 บน wiki',
  },

  // ----------------------------------------------------------- SPECIAL ROOMS
  library: {
    door: 50,
    booksTotal: 8,
    codeDigits: 5,
    lastBookCollectedIsFinalDigit: true,
    guessingNote: 'ขาด 1 หลัก ≤10 ครั้ง; ขาด 2 หลัก ≤100 ครั้ง',
    blockedStairSide: 'random_left_or_right',
    alarmClockTickSec: 10,
    exitDoor: 51,
    leftBehindPlayersTeleportedBy: 'void',
  },
  electricalRoom: {
    door: 100,
    breakerSwitches: 10,
    puzzleType: 'memory_sequence',
    figureAbsentDuringPuzzle: true,
    reviveAllowed: false,
    elevatorFinalEvent: 'figure_falls_into_mineshaft',
    hideInactiveAfterLeverPull: true,
    deadPlayersAlsoTeleportedToMines: true,
  },
  meetingRoom: {
    paintings: 4,
    spawnLocations: 6,
    outlineColor: 'light_blue',
    reward: 'fireplace_moves_down_reveals_door',
  },
  courtyard: { door: 89, closetsAround: 6, shearsInGardeningCloset: true, basementEntrance: 'vine_trapdoor_needs_shears' },
  greenhouse: { doors: [90, 98], layouts: 3, alwaysDark: true, noItemsSpawn: true, crucifixOnWallsPossible: true, noLockedDoors: true },
  basement: { door: 61, leverOpensAllGates: true, guidingLightHighlightAfterSec: 60 },
  infirmary: { skeletonKeyRoom: true, greenHerb: true, vitaminsAlmostGuaranteed: true, onePerRun: true },
};

// ======================================================================== //
// ค่าที่ "ผู้พัฒนา 2D ต้องกำหนดเอง" — ไม่ใช่ค่าจากต้นฉบับ                        //
// ======================================================================== //
export const TWO_D = {
  note: 'ทุกค่าเป็น null จนกว่าจะตัดสินใจ — ใช้ค่าจาก RULES ไม่ได้ตรง ๆ',
  pxPerStud: null,
  canvasSize: null,
  playerWalkSpeedPxPerSec: null,
  playerCrouchSpeedPxPerSec: null,
  entitySpeedPxPerSec: { rush: null, ambush: null, figureWalk: null, figureRun: null, seek: null, halt: null, sally: null, dread: null },
  figureHearingRadiusPx: { walk: null, crouch: null, run: null, flashlightToggle: null, alarmClock: null },
  facingFlipForScreechAndHalt: true,
  eyesReplacementMechanic: null, // ต้องออกแบบเอง
  entitiesNotNeededIn2D: ['glitch'],
  conditionalIn2D: ['void'],
};

// ======================================================================== //
// สูตร (Formulas)                                                             //
// ======================================================================== //
export const F = {
  /** 20 gold = 1 Knob; เศษ ≥10 ปัดขึ้น +1; เศษ ≤9 ทิ้ง; เพดาน 500 Knobs */
  goldToKnobs(gold) {
    const base = Math.floor(gold / RULES.economy.goldPerKnob.value);
    const rem = gold % RULES.economy.goldPerKnob.value;
    const k = base + (rem >= RULES.economy.knobRoundUpRemainderAtLeast.value ? 1 : 0);
    return Math.min(RULES.economy.knobCap.value, k);
  },

  /** Flashlight: แบตเตอรี่ 1 ก้อน +50% (ค่าสูงสุด 110%) — frac = 0..1.1 */
  rechargeFlashlight(frac, batteries = 1) {
    return Math.min(RULES.items.flashlight.overchargeMaxFraction.value,
      frac + batteries * RULES.items.flashlight.batteryAddsFraction.value);
  },
  flashlightSecondsLeft(frac) {
    return frac * RULES.items.flashlight.maxUseSec.value;
  },

  /** Sally jumpscare: HP เหลือ 1/3 (ขั้นต่ำ 3, ไม่เกิน HP เดิม) — การปัดเศษ wiki ไม่ระบุ */
  sallyHit(hp, maxHp) {
    const newHp = Math.min(hp, Math.max(3, hp / 3));
    const newMax = Math.max(50, maxHp / 1.3);
    return { hp: newHp, maxHp: Math.min(maxHp, newMax), oxygen: 0.05 };
  },

  /**
   * Timothy: ปกติ −5 HP; ถ้า HP ≤5 → wiki บอก "ดาเมจ 0-4 เหลือ 1-4 HP" (ไม่ฆ่า)
   * itchy (modifier) = −10 และฆ่าได้. การจัดการกรณี HP<5 เป็นการตีความ (คง HP ไม่เกินของเดิม)
   */
  timothyHit(hp, itchy = false, rng = Math.random) {
    if (itchy) return hp - 10;
    if (hp <= 5) return Math.min(hp, 1 + Math.floor(rng() * 4)); // เหลือ 1-4
    return hp - 5;
  },

  /** Snare ไม่ฆ่า (ยกเว้น modifier) — ค่าอ้างอิง 20 (⚠ หน้า Greenhouse = 10, ไม่ต่ำกว่า 1) */
  snareHit(hp, dmg = RULES.damage.snare.value) {
    return Math.max(1, hp - dmg);
  },

  /** Dupe: ถ้า HP ≤ 40 → ตาย (ลากเข้ารู) */
  dupeHit(hp) {
    const dmg = RULES.damage.dupe.value;
    return { hp: Math.max(0, hp - dmg), dies: hp <= dmg };
  },

  /** Rush/Ambush ฆ่าถ้า damage ≥ HP+overheal (wiki: Overheal รอดได้) */
  survivesHit(hp, overheal, dmg) {
    return hp + overheal > dmg;
  },

  /** Hide: วินาทีที่อยู่ในตู้ก่อนถูกไล่ออก */
  hideKickoutSec({ rentsDue = false, ambushActive = false, inFigureRoom = false, inElectricalRoom = false } = {}) {
    if (inElectricalRoom) return Infinity;
    if (inFigureRoom) return 0;
    if (rentsDue) return RULES.entities.hide.kickOutSecRentsDue.value[0]; // 5-6
    return RULES.entities.hide.kickOutSec.value; // 12
  },

  /** Dread: เวลาจริง (นาที) ที่ต้องอยู่ห้องเดียวก่อนเที่ยงคืน; เปิดประตูใด ๆ → รีเซ็ตเป็น 11:00 */
  dreadMinutesUntilSpawn({ bigEncounterRoom = false } = {}) {
    const perHour = bigEncounterRoom
      ? RULES.entities.dread.realMinutesPerGameHourInBigEncounterRooms.value
      : RULES.entities.dread.realMinutesPerGameHour.value;
    return perHour * (RULES.entities.dread.triggerClockHour - RULES.entities.dread.resetClockHourOnDoorOpen);
  },

  /** Void: ตามหลังกลุ่มกี่ห้องจึงเตือน */
  voidWarnRoomsBehind({ infirmarySpawned = false, seek2Done = false } = {}) {
    const r = RULES.entities.void;
    if (seek2Done) return r.warnAtRoomsBehindAfterSeek2.value;
    if (infirmarySpawned) return r.warnAtRoomsBehindAfterInfirmary.value;
    return r.warnAtRoomsBehind.value;
  },

  /** Seek chase ที่ door นี้: คืน 1/2/null (ใช้ช่วงของ Seek page; ปรับ alt ได้) */
  seekChaseForDoor(door) {
    const c1 = RULES.entities.seek.chase1.value.startDoor;
    const c2 = RULES.entities.seek.chase2.value.startDoor;
    if (door >= c1[0] && door <= c1[1]) return 1;
    if (door >= c2[0] && door <= c2[1]) return 2;
    return null;
  },

  /** Rush: เกิดได้ที่ door นี้ไหม (ไม่ระบุความน่าจะเป็น) */
  rushCanSpawnAt(door) {
    const [lo, hi] = RULES.entities.rush.doorRange.value;
    return door >= lo && door <= hi;
  },

  /** Eyes: ดาเมจต่อ tick — lerp จากขอบจอ (3) → กลางจอ (10) ; wiki ไม่ให้เส้นโค้งจริง ❓ */
  eyesDamage(distFromScreenCenter01) {
    const [lo, hi] = RULES.entities.eyes.damageByScreenPosition.value;
    const t = 1 - Math.min(1, Math.max(0, distFromScreenCenter01));
    return lo + (hi - lo) * t; // เป็นการประมาณ — ค่าจริงของเส้นโค้งไม่ได้อยู่บน wiki
  },

  /** Library: จำนวนเลขหลักที่ยังไม่รู้ → จำนวนครั้งเดาสูงสุด (10^n) */
  libraryMaxGuesses(missingDigits) {
    return Math.pow(10, missingDigits);
  },

  /** Jeff Shop: สุ่ม 4 ชิ้นจากพูล 6 — Skeleton Key รับประกัน */
  rollJeffShop(rng = Math.random) {
    const shop = RULES.economy.jeffShop;
    const picked = new Set(shop.guaranteed);
    const rest = shop.pool.filter((x) => !picked.has(x));
    while (picked.size < shop.slotsSold.value && rest.length) {
      picked.add(rest.splice(Math.floor(rng() * rest.length), 1)[0]);
    }
    return [...picked];
  },

  /** รวมค่า Gold จากรายการสิ่งที่เก็บ */
  sumGold(items) {
    const v = RULES.economy.goldValues.value;
    return items.reduce((s, k) => s + (v[k] ?? 0), 0);
  },
};

export default { RULES, TWO_D, F };
