<script setup lang="ts">
import ErrorBox from '~/components/errors/ErrorBox.vue';

const event = useRequestEvent()
if (event) {
  setResponseStatus(event, 404)
}

const err = getErrorByStatusCode(404)
</script>

<template>
  <div class="flex min-h-[90vh] items-center justify-center px-4 py-24">
    <ErrorBox
      :head="`ERROR 404`"
      :title="err.name.toUpperCase()"
      :description="err.desc" />
  </div>
</template>