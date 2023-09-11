// pages/admin.vue
<script setup lang='ts'>
import { useToast } from 'primevue/usetoast';
import { CreateNFTBodyParams } from '../server/utils/underdog';
import openaiApi from "../server/api/generate/openaiApi"

const { data } = await useAsyncData<{ subscribers: string[] }>('subscribers',
  () => $fetch('/api/subscribers', {
    method: 'GET',
  })
);

const toast = useToast();

const nft = useState('nft', () => {
  return {
    name: '',
    description: '',
    symbol: '',
    image: '',
  }
});

const counter = ref(0);
const increment = () => {
  counter.value++;
};
const decrement = () => {
  counter.value--;
};

const imageName = useState<string>('imageName', () => '');

const customImageBase64Uploader = async (event: any) => {
  const file = event.files[0];
  imageName.value = file.name;
  const reader = new FileReader();
  let blob = await fetch(file.objectURL).then((r) => r.blob());

  reader.readAsDataURL(blob);

  reader.onloadend = function () {
    nft.value.image = reader.result?.toString() ?? '';
  };
};

const isLoading = useState('isLoading', () => false);

const onSubmit = async () => {
  toast.add({
    severity: 'info', summary: 'Loading', detail: 'Distributing NFTs...', life: 3000,
  });
  isLoading.value = true;
  const res = await $fetch('/api/nfts/batch', {
    method: 'POST',
    body: <CreateNFTBodyParams>{
      image: nft.value.image,
      name: nft.value.name,
      description: nft.value.description,
      symbol: nft.value.symbol,
    }
  })
  if (res.statusCode == 200) {
    toast.add({ severity: 'success', summary: 'Success', detail: 'Successfully distributed ✅', life: 3000 });
    isLoading.value = false;
  }
}

const prompt = useState<string>('prompt', () => '');
const summaryPrompt = useState<string>('summaryPrompt', () => '');
const content = useState<string>('content', () => '');
const generateContent = async () => {
  try {
    const response = await $fetch("/api/generate/chat", {
      method: "POST",
      body: {
        prompt: prompt.value,
      }
    });
    if (response && response.statusCode === 200) {
      content.value = response.summary;
      console.log(content.value);
    }

  } catch (error: any) {
    console.log(error);
  }
}
const generateSummaryPrompt = async () => {
  try {
    const response = await $fetch("/api/generate/summary", {
      method: "POST",
      body: {
        prompt: prompt.value,
      }
    });
    if (response && response.statusCode === 200) {
      summaryPrompt.value = response.summary;
      console.log(summaryPrompt.value);
    }

  } catch (error: any) {
    console.log(error);
  }
}

const generateImage = async () => {
  try {
    const response = await $fetch("/api/generate/image", {
      method: "POST",
      body: {
        prompt: summaryPrompt.value,
      }
    });
    if (response && response.statusCode === 200) {
      nft.value.image = response.image;
      console.log(nft.value.image);
    }

  } catch (error: any) {
    console.log(error);
  }
}
</script>
<template>
  <div class="h-screen w-screen flex flex-row relative">
    <div v-if="isLoading" class="w-screen h-screen flex items-center justify-center absolute z-30 backdrop-blur-lg">
      <ProgressSpinner strokeWidth="4" />
    </div>
    <div class="w-1/2 flex flex-col justify-center items-center p-10 bg-white/[0.02] border-r border-r-white/5">
      <div class="flex flex-col w-full">
        <FileUpload v-if="!nft.image" mode="advanced" :fileLimit="1" :showUploadButton="false" name="meme"
          accept="image/*" :maxFileSize="10000000" customUpload @uploader="customImageBase64Uploader" auto />

        <div v-else
          class="text-lg mb-4 bg-gray-900 shadow-lg shadow-black/10 border-white/5 p-4 rounded-md text-white/50">
          {{ imageName }}
        </div>

        <div class="flex flex-col py-8 space-y-7">
          <span class="p-float-label">
            <InputText class="w-full" v-model="prompt" type="text" />
            <label for="value">Prompt</label>
            <Button outlined class="w-[80%]" type="submit" label="Generate content" @click="generateContent" />
            <textarea class="w-[80%] " v-model="content" type="text" />
            <button @click="increment">upvote</button>
            <button @click="decrement">downvote</button>
            <p>{{ counter }}</p>
          </span>
          <div>
          </div>
          <span class="p-float-label">
            <Button outlined class="w-[80%]" type="submit" label="Summarize content" @click="generateSummaryPrompt" />
            <textarea class="w-[80%]" v-model="summaryPrompt" type="text" />
          </span>

          <span class="p-float-label">
            <InputText class="w-full" v-model="summaryPrompt" type="text" />
            <label for="value">Summary Prompt</label>
            <Button outlined class="w-[80%]" type="submit" label="Generate Image" @click="generateImage" />
            <img class="w-[80%]" :src="nft.image" />
          </span>

          <span class="p-float-label">
            <InputText class="w-full" v-model="nft.name" type="text" />
            <label for="value">Name</label>
          </span>

          <span class="p-float-label">
            <InputText class="w-full" v-model="nft.symbol" type="text" />
            <label for="value">Symbol</label>
          </span>

          <span class="p-float-label">
            <Textarea class="w-full" v-model="nft.description" type="text" />
            <label for="value">Description</label>
          </span>
        </div>
      </div>
    </div>

    <div :class="['w-1/2 flex flex-col justify-center items-center p-10 space-y-5 transition-all duration-500',
      nft.image === '' || nft.description === '' || nft.symbol === '' || nft.name === '' ? 'opacity-20 blur-lg' : ''
    ]">
      <div class="w-[80%] p-5 rounded-lg bg-white/5">
        <p class="text-lg">{{ data?.subscribers.length }} Subscribers</p>
        <p class="text-white/80" v-for="sub in data?.subscribers" :key="sub">
          {{ sub }}
        </p>
      </div>
      <Button outlined class="w-[80%]" type="submit" label="Send out MemeLetter" @click="onSubmit" />
    </div>
  </div>
</template>

<!-- <script setup lang='ts'>
import { useToast } from 'primevue/usetoast';
import { CreateNFTBodyParams } from '../server/utils/underdog';
import openaiApi from "../server/api/generate/openaiApi"


  const { data } = await useAsyncData<{ subscribers: string[] }>('subscribers',
    () => $fetch('/api/subscribers', {
      method: 'GET',
    })
  );
  
  const toast = useToast();
  
  const nft = useState('nft', () => {
    return {
      name: '',
      description: '',
      symbol: '',
      image: '',
    }
  });
  
  const imageName = useState<string>('imageName', () => '');
  
  const customImageBase64Uploader = async (event: any) => {
    const file = event.files[0];
    imageName.value = file.name;
    const reader = new FileReader();
    let blob = await fetch(file.objectURL).then((r) => r.blob());
  
    reader.readAsDataURL(blob);
  
    reader.onloadend = function () {
      nft.value.image = reader.result?.toString() ?? '';
    };
  };
  
  const isLoading = useState('isLoading', () => false);
  
  const onSubmit = async () => {
    toast.add({
      severity: 'info', summary: 'Loading', detail: 'Distributing NFTs...', life: 3000,
    });
    isLoading.value = true;
    const res = await $fetch('/api/nfts/batch', {
      method: 'POST',
      body: <CreateNFTBodyParams>{
        image: nft.value.image,
        name: nft.value.name,
        description: nft.value.description,
        symbol: nft.value.symbol,
      }
    })
    if (res.statusCode == 200) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Successfully distributed ✅', life: 3000 });
      isLoading.value = false;
    }
  }
  
  const prompt = useState<string>('prompt', () => '');
  
  const generateImage = async () => {
    try {
      const response = await $fetch("/api/generate",{
        method:"POST",
        body: {
          prompt: prompt.value,
        }
      });
      if (response && response.statusCode === 200) {
        nft.value.image = response.image;
        console.log(nft.value.image);
      }
  
    } catch (error: any) {
      console.log(error);
    }
  }
  </script>
<template>
    <div class="h-screen w-screen flex flex-row relative">
      <div v-if="isLoading" class="w-screen h-screen flex items-center justify-center absolute z-30 backdrop-blur-lg">
        <ProgressSpinner strokeWidth="4" />
      </div>
      <div class="w-1/2 flex flex-col justify-center items-center p-10 bg-white/[0.02] border-r border-r-white/5">
        <div class="flex flex-col w-full">
          <FileUpload v-if="!nft.image" mode="advanced" :fileLimit="1" :showUploadButton="false" name="meme"
            accept="image/*" :maxFileSize="10000000" customUpload @uploader="customImageBase64Uploader" auto />
  
          <div v-else
            class="text-lg mb-4 bg-gray-900 shadow-lg shadow-black/10 border-white/5 p-4 rounded-md text-white/50">
            {{ imageName }}
          </div>
  
          <div class="flex flex-col py-8 space-y-7">
            <span class="p-float-label">
              <InputText class="w-full" v-model="prompt" type="text" />
              <label for="value">Prompt</label>
              <img class="w-full" :src="nft.image" />
            </span>
  
            <Button outlined class="w-[80%]" type="submit" label="Generate Image" @click="generateImage" />
  
            <span class="p-float-label">
              <InputText class="w-full" v-model="nft.name" type="text" />
              <label for="value">Name</label>
            </span>
  
            <span class="p-float-label">
              <InputText class="w-full" v-model="nft.symbol" type="text" />
              <label for="value">Symbol</label>
            </span>
  
            <span class="p-float-label">
              <Textarea class="w-full" v-model="nft.description" type="text" />
              <label for = "value">Description</label>
            </span>
          </div>
        </div>
      </div>
  
      <div :class="[ 'w-1/2 flex flex-col justify-center items-center p-10 space-y-5 transition-all duration-500',
        nft.image === '' || nft.description === '' || nft.symbol === '' || nft.name === '' ? 'opacity-20 blur-lg' : ''
      ]">
        <div class="w-[80%] p-5 rounded-lg bg-white/5">
          <p class="text-lg">{{ data?.subscribers.length }} Subscribers</p>
          <p class = "text-white/80" v-for= "sub in data?.subscribers" :key= "sub">
            {{ sub }}
          </p>
        </div>
        <Button outlined class ="w-[80%]" type= "submit" label= "Send out MemeLetter" @click= "onSubmit" />
      </div>
    </div>
  </template> -->