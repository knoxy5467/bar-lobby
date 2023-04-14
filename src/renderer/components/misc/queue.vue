<template>
    <div class="flex-box">
        <h1 class="queue-name">{{ props.queueName }}</h1>
        <div class = "queue-checks-container">

        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    queueName: string;
    queue: string;
}>();
</script>
