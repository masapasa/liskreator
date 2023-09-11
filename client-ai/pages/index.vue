<script setup lang="ts" >
import { useWallet } from "solana-wallets-vue";
import type { Adapter } from "@solana/wallet-adapter-base";
import { useToast } from "primevue/usetoast";
import { SigninMessage } from "../server/utils/signin_message";
import bs58 from "bs58";

const isOpen = useState("isOpen", () => false)

const { wallets, connected, publicKey, connect, select, disconnect, wallet, signMessage } = useWallet();

const onConnect = async (adapter: Adapter) => {
    try {
        select(adapter.name);
        await connect();
        isOpen.value = false;
    }
    catch (err) {
        console.log(err);
        isOpen.value = false;
    }
}

const { status, signIn, signOut, getCsrfToken, data: authData } = useAuth();

const handleSignIn = async () => {
    try {
        const csrf = await getCsrfToken();
        if (!publicKey.value || !csrf || !signMessage.value) return;

        const message = new SigninMessage({
            domain: window.location.host,
            publicKey: publicKey.value.toString(),
            statement: `Sign this message to authenticate as ${publicKey.value
                .toString()
                .slice(0, 5)}...\n\n`,
            nonce: csrf,
        });

        const data = new TextEncoder().encode(message.prepare());
        const signature = await signMessage.value(data);
        const serializedSignature = bs58.encode(signature);

        const res = await signIn("credentials", {
            message: JSON.stringify(message),
            redirect: false,
            signature: serializedSignature,
        });
        if (res?.error) {
            toast.add({
                severity: "error",
                summary: "Error",
                detail: res.error,
            })
        }
    } catch (error) {
        console.log(error);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: error,
        })
    }
};

const toast = useToast();

watch(
    () => connected.value,
    (connected) => {
        isOpen.value = false;
        if (connected && status.value === "unauthenticated") {
            handleSignIn().then(async () => {
                toast.add({
                    severity: "success",
                    detail: "Logged in"
                })
                const res = await $fetch<{
                    statusCode: number;
                    message: string;
                }>("/api/subscribe", {
                    method: "POST",
                    body: {
                        publicKey: publicKey.value?.toString()
                    }
                })
            })

        }
        if (!connected && status.value === "authenticated") {
            console.log(authData.value);
            signOut();
        }
    }
);
</script>

<template>
    <div class="h-screen w-screen flex flex-col items-center justify-center">
        <Dialog v-model:visible="isOpen" :draggable="false" modal dismissable-mask header="Connect Wallet"
            style="max-width: 400px;">
            <div class="flex flex-col items-center justify-center space-y-3">
                <button @click="onConnect(adapter)" v-for="{ adapter } in wallets" :key="adapter.name"
                    class="w-80 h-14 p-2 px-4 space-x-4 flex flex-row items-center justify-start bg-gradient-to-br from-white/10 to-white/0 hover:scale-105 active:scale-95 rounded-lg transition-all duration-300">
                    <img :src="adapter.icon" class="w-8 h-8" />
                    <p class="text-xl font-medium">{{ adapter.name }}</p>
                </button>
            </div>
        </Dialog>

        <div v-if="publicKey" class="flex flex-col space-y-7 items-center justify-center">
            <div v-if="authData?.user" class="flex flex-col items-center justify-center space-y-1.5">
                <h1 class="text-3xl text-white/80">You Joined the MemeLetter! 💪</h1>
                <p class="text-white/50">as {{ publicKey?.toBase58().slice(0, 4) }}...{{ publicKey?.toBase58().slice(-4) }}
                </p>
            </div>
            <img class="h-80 rounded-md shadow-2xl shadow-black"
                src="https://media0.giphy.com/media/l4FGpPki5v2Bcd6Ss/giphy.gif?cid=ecf05e47ed009xbxr52nzd6npu753ly3g5k0b4u0v8ks6b43&ep=v1_gifs_search&rid=giphy.gif&ct=g" />
            <Button outlined @click="disconnect()" class="space-x-2">
                <img :src="wallet?.adapter.icon" class="w-5 h-5" />
                <div>
                    Disconnect
                </div>
            </Button>
        </div>
        <div v-else class="flex flex-col space-y-7 items-center justify-center">
            <img class="h-80 rounded-md shadow-2xl shadow-black"
                src="https://media0.giphy.com/media/Lopx9eUi34rbq/giphy.gif?cid=ecf05e47wteiapo0z4g64dlvycgvn2mnwz13qehsv8lz6pv3&ep=v1_gifs_search&rid=giphy.gif&ct=g" />
            <Button outlined @click="isOpen = true">Sign up for the MemeLetter 🔥</Button>
        </div>
    </div>
</template>