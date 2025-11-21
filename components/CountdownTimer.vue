<script setup>
import { ref, onMounted, onUnmounted } from "vue"

const props = defineProps({
  endDate: {
    type: String,
    required: true,
  },
})

const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
})

let intervalId = null

const updateCountdown = () => {
  const targetDate = new Date(props.endDate).getTime()
  const now = new Date().getTime()
  const difference = targetDate - now

  if (difference > 0) {
    countdown.value = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    }
  } else {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
}

onMounted(() => {
  updateCountdown()
  intervalId = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="countdown">
    <div class="countdown-timer">
      <div class="time-unit">
        <div class="flip-number">{{ String(countdown.days).padStart(2, "0") }}</div>
        <div class="label">days</div>
      </div>
      <div class="time-unit">
        <div class="flip-number">{{ String(countdown.hours).padStart(2, "0") }}</div>
        <div class="label">hours</div>
      </div>
      <div class="time-unit">
        <div class="flip-number">
          {{ String(countdown.minutes).padStart(2, "0") }}
        </div>
        <div class="label">minutes</div>
      </div>
      <div class="time-unit">
        <div class="flip-number">
          {{ String(countdown.seconds).padStart(2, "0") }}
        </div>
        <div class="label">seconds</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.countdown {
  margin-bottom: 2rem;
}

.countdown-timer {
  display: flex;
  gap: 1.125rem;
  justify-content: center;
  align-items: center;
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
}

.flip-number {
  background: #000;
  color: #fff;
  font-size: 2.25rem;
  font-weight: bold;
  padding: 0.75rem 1.125rem;
  border-radius: 6px;
  min-width: 75px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  font-family: "Courier New", monospace;
  position: relative;
}

.flip-number::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1.5px;
  background: rgba(255, 255, 255, 0.1);
}

.label {
  font-size: 0.9375rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 0.75px;
}
</style>
