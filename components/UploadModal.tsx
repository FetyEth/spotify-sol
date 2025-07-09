"use client"

import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import uniqid from "uniqid";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

import useUploadModal from "@/hooks/useUploadModal";
import { useCreateCoin } from "@/hooks/useCreateCoin";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const UploadModal = () => {
    const [isLoading, setIsLoading] = useState(false);
    const uploadModal = useUploadModal();
    const { user } = useUser();
    const { address } = useAccount();
    const supabaseClient = useSupabaseClient();
    const router = useRouter();
    const { create: createCoin, isLoading: isCreatingCoin } = useCreateCoin();

    const {
        register,
        handleSubmit,
        reset,
        watch
    } = useForm<FieldValues>({
        defaultValues: {
            author: '',
            title: '',
            song: null,
            image: null,
            createCoin: false,
            coinSymbol: '',
            initialPurchaseAmount: '0.01'
        }
    })

    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            uploadModal.onClose();
        }
    }

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        try {
            setIsLoading(true);

            const imageFile = values.image?.[0];
            const songFile = values.song?.[0];

            if (!imageFile || !songFile || !user) {
                toast.error("Missing field");
                return;
            }

            const uniqueID = uniqid();

            // Upload song
            const {
                data: songData,
                error: songError,
            } = await supabaseClient
                .storage
                .from('songs')
                .upload(`song-${values.title}-${uniqueID}`, songFile, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (songError) {
                setIsLoading(false);
                return toast.error('Failed song upload.');
            }

            // Upload image
            const {
                data: imageData,
                error: imageError,
            } = await supabaseClient
                .storage
                .from('images')
                .upload(`image-${values.title}-${uniqueID}`, imageFile, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (imageError) {
                setIsLoading(false);
                return toast.error('Failed image upload.');
            }

            let coinAddress;
            if (values.createCoin && address) {
                try {
                    // Create coin for the song using metadata-aware creation
                    const result = await createCoin({
                        name: values.title,
                        symbol: values.coinSymbol || values.title.slice(0, 5).toUpperCase(),
                        description: `Fan token for ${values.title} by ${values.author}`,
                        image: imageFile,
                        payoutRecipient: address,
                        initialPurchaseAmount: values.initialPurchaseAmount
                    });
                    coinAddress = result.address;
                    toast.success('Coin created successfully!');
                } catch (error) {
                    console.error('Failed to create coin:', error);
                    toast.error('Failed to create coin. Song will be uploaded without a coin.');
                }
            }

            const {
                error: supabaseError
            } = await supabaseClient
                .from('songs')
                .insert({
                    user_id: user.id,
                    title: values.title,
                    author: values.author,
                    image_path: imageData.path,
                    song_path: songData.path,
                    coin_address: coinAddress
                })

            if (supabaseError) {
                setIsLoading(false);
                return toast.error(supabaseError.message);
            }

            router.refresh();
            setIsLoading(false);
            toast.success('Song created!');
            reset();
            uploadModal.onClose();
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    const createCoinEnabled = watch('createCoin');

    return (
        <Modal
            title="Add a song"
            description="Upload an mp3 file and optionally create a fan token"
            isOpen={uploadModal.isOpen}
            onChange={onChange}
        >
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-y-4"
            >
                <Input 
                    id="title"
                    disabled={isLoading}
                    {...register('title', { required: true })}
                    placeholder='Song title'
                />
                <Input 
                    id="author"
                    disabled={isLoading}
                    {...register('author', { required: true })}
                    placeholder='Song author'
                />
                <div>
                    <div className="pb-1">
                        Select a song file
                    </div>
                    <Input 
                        id="song"
                        type="file"
                        disabled={isLoading}
                        accept=".mp3"
                        {...register('song', { required: true })}
                    />
                </div>
                <div>
                    <div className="pb-1">
                        Select an image
                    </div>
                    <Input 
                        id="image"
                        type="file"
                        disabled={isLoading}
                        accept="image/*"
                        {...register('image', { required: true })}
                    />
                </div>
                {address && (
                    <div className="flex flex-col gap-y-2">
                        <div className="flex items-center gap-x-2">
                            <input
                                type="checkbox"
                                id="createCoin"
                                {...register('createCoin')}
                                className="h-4 w-4"
                            />
                            <label htmlFor="createCoin">
                                Create fan token for this song
                            </label>
                        </div>
                        {createCoinEnabled && (
                            <>
                                <Input 
                                    id="coinSymbol"
                                    disabled={isLoading}
                                    {...register('coinSymbol')}
                                    placeholder='Token symbol (optional)'
                                />
                                <Input 
                                    id="initialPurchaseAmount"
                                    type="number"
                                    step="0.01"
                                    disabled={isLoading}
                                    {...register('initialPurchaseAmount')}
                                    placeholder='Initial purchase amount in ETH'
                                />
                                <p className="text-sm text-neutral-400">
                                    Initial purchase amount in ETH to seed liquidity pool. Default: 0.01 ETH
                                </p>
                            </>
                        )}
                    </div>
                )}
                <Button 
                    disabled={isLoading || isCreatingCoin} 
                    type="submit"
                >
                    Create{isLoading || isCreatingCoin ? 'ing...' : ''}
                </Button>
            </form>
        </Modal>
    );
}

export default UploadModal;