// World-space constants. 1 world unit ≈ 1 px at scale 1.
// The playable "band" is y = 0 … 270. The renderer extends ceiling above 0 and floor below 270
// to fill tall (portrait) screens, but gameplay always happens on the band.
export const W = {
  VIEW_H: 270,        // height of the gameplay band
  MIN_VIEW_W: 290,    // narrowest visible world width (portrait phones)
  CEIL: 36,           // bottom of ceiling / top of wall
  RAIL: 146,          // chair rail (top of wainscot)
  BASE: 198,          // bottom of back wall (floor starts)
  FEET: 240,          // walking line (player feet)
  FLOOR_FRONT: 270,   // front edge of the band
  TILE_W: 256,        // static render cache tile width
  PART_W: 72,         // partition (wall between rooms) width
  DOOR_W: 50,
  DOOR_H: 96,
};

export const PLAYER = {
  W: 22,
  H: 62,
  CROUCH_H: 40,
  WALK: 112,
  CROUCH: 52,
  ACCEL: 900,
  DECEL: 1300,
  GRAVITY: 1400,
  INTERACT_RANGE: 30,
};

export const SAVE_KEY = 'doors-rezona-save-v1';
export const SETTINGS_KEY = 'doors-rezona-settings-v1';
