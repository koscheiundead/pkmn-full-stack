<script setup lang="ts">
</script>

<template>
  <div class="pokedex-shell">
    <div class="pokedex-top">
      <div class="big-blue-light">
        <div class="reflection"></div>
      </div>
      <div class="small-lights">
        <div class="light red"></div>
        <div class="light yellow"></div>
        <div class="light green"></div>
      </div>
    </div>

    <div class="pokedex-body">
      <div class="inner-screen-border">
        <main class="viewport">
          <router-view />
        </main>
      </div>
    </div>

    <div class="pokedex-footer">
      <div class="d-pad">
        <div class="horizontal"></div>
        <div class="vertical"></div>
      </div>
      <div class="action-buttons">
        <div class="button long-blue"></div>
        <div class="button long-green"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokedex-shell {
  max-width: 700px;
  max-height: 1000px;
  overflow: scroll;
  margin: 20px auto;
  background-color: var(--pokedex-red);
  border: 4px solid #000;
  border-radius: 20px 0 20px 20px;
  box-shadow: 10px 10px 0 var(--pokedex-dark-red);
  padding: 20px;
  position: sticky;
}

.pokedex-top {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 4px solid var(--pokedex-dark-red);
}

.big-blue-light {
  width: 60px;
  height: 60px;
  background: radial-gradient(circle at 30% 30%, var(--pokedex-glass-blue), #004a52);
  border: 5px solid white;
  border-radius: 50%;
  box-shadow: 0 0 15px var(--pokedex-glass-blue);
}

.small-lights {
  display: flex;
  gap: 8px;
}

.light {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 2px solid black;
}

.red {
  background: #ff0000;
}

.yellow {
  background: #ffcc00;
}

.green {
  background: #32ff00;
}

/* screen housing */
.pokedex-body {
  background: #dedede;
  padding: 15px;
  border-radius: 10px 10px 10px 40px; /* iconic slanted corner babes */
  border: 4px solid black;
}

.inner-screen-border {
  background: var(--pokedex-screen-bg);
  border-radius: 5px;
  padding: 10px;
  min-height: 400px;
}

.viewport {
  overflow-y: auto;
  color: white;
  position: relative;
  height: 550px;
  overflow-y: auto;
  overflox-x: hidden;
  background-color: var(--pokedex-screen-bg);
  padding: 15px;
  color: #fff;
  z-index: 1;
}

/* scanline overlay */
.viewport::before {
  content: " ";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%,
    rgba(0, 0, 0, 0.1) 50%
  ),
  linear-gradient(90deg,
    rgba(255, 0, 0, 0.02),
    rgba(0, 255, 0, 0.01),
    rgba(0, 0, 255, 0.02)
  );
  background-size: 100% 4px, 3px 100%;
  pointer-events: none; /* allows clicking through to card */
  z-index: 10;
}

/* moving scan bar */
.viewport::after {
  content: " ";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(18, 16, 16, 0.03);
  opacity: 0;
  z-index: 11;
  pointer-events: none;
  animation: scanline 8s linear infinite;
}

@keyframes scanline {
  0% {transform: translateY(-100%);}
  100% {transform: translateY(100%);}
}

.viewport::-webkit-scrollbar {
  width: 8px;
}

.viewport::-webkit-scrollbar-track {
  background: #111;
}

.viewport::-webkit-scrollbar-thumb {
  background: var(--pokedex-red);
  border: 1px solid black;
}
</style>
