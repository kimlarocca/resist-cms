<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-gray-900 text-white py-8 mt-16">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-2 gap-8">
        <!-- About Section -->
        <div>
          <h3 class="text-xl font-bold mb-4 text-red-400">
            About People Are People NJ
          </h3>
          <p class="text-gray-300">
            We're dedicated to exposing the truth about Jack Ciattarelli's
            flip-flopping politics and authoritarian agenda. New Jersey deserves
            better.
          </p>
        </div>

        <!-- Social Media -->
        <div>
          <h3 class="text-xl font-bold mb-4 text-red-400">Follow Us</h3>
          <div class="flex space-x-4">
            <Button icon="pi pi-facebook" severity="secondary" text rounded class="text-white hover:bg-red-600" />
            <Button icon="pi pi-twitter" severity="secondary" text rounded class="text-white hover:bg-red-600" />
            <Button icon="pi pi-instagram" severity="secondary" text rounded class="text-white hover:bg-red-600" />
          </div>
        </div>
      </div>

      <Divider class="my-6 border-gray-700" />

      <div class="text-center">
        <p class="mb-2 text-white">
          Copyright © {{ currentYear }} People Are People NJ. All Rights
          Reserved.
        </p>
        <p class="italic text-sm text-white">
          Paid for by People Are People NJ. Because New Jersey deserves a
          governor with backbone—not a weathervane.
        </p>
      </div>
    </div>
  </footer>
</template>
