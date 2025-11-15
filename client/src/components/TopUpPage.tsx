import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, ArrowLeft, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from 'qrcode.react';
import * as api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface TopUpPageProps {
  userId?: string;
  onBack: () => void;
  onTopUpComplete?: (amount: number) => void;
}

const DEPOSIT_ADDRESS = "TDAaY316MmtuwuDhLfxNHBxqUAS4XkBNSJ";

export default function TopUpPage({ userId, onBack, onTopUpComplete }: TopUpPageProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const { toast } = useToast();

  const copyAddress = () => {
    navigator.clipboard.writeText(DEPOSIT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInTronLink = () => {
    const tronlinkUrl = `tronlinkoutside://wallet/transfer?address=${DEPOSIT_ADDRESS}`;
    window.open(tronlinkUrl, '_blank');
  };

  const handleCreateDeposit = async () => {
    if (!userId) {
      toast({
        title: 'Ошибка',
        description: 'Пользователь не авторизован',
        variant: 'destructive',
      });
      return;
    }

    const depositAmount = parseFloat(amount);
    if (!amount || isNaN(depositAmount) || depositAmount <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректную сумму депозита',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.createDeposit(userId, depositAmount, txHash || undefined);
      
      toast({
        title: 'Заявка создана',
        description: 'Ваша заявка на депозит отправлена администратору',
      });
      
      setIsComplete(true);
      
      if (onTopUpComplete) {
        setTimeout(() => {
          onTopUpComplete(depositAmount);
        }, 2000);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать депозит',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 pb-28">
        <div className="max-w-md w-full text-center space-y-8 animate-slide-up">
          <div className="flex justify-center">
            <div className="w-28 h-28 rounded-full gradient-success flex items-center justify-center shadow-md">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <Card className="p-10 shadow-card gradient-card rounded-lg">
            <div className="space-y-5">
              <h2 className="text-4xl font-bold text-foreground">Заявка отправлена!</h2>
              <p className="text-lg text-muted-foreground font-medium">
                Ваша заявка на пополнение <span className="font-bold text-foreground">{amount} USDT</span> отправлена администратору.
              </p>
              <p className="text-sm text-muted-foreground">
                После проверки транзакции средства будут зачислены на ваш баланс.
              </p>
            </div>
          </Card>
          <Button onClick={onBack} className="w-full min-h-[52px] rounded-lg gradient-primary shadow-premium text-white font-bold">
            Вернуться на главную страницу
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] px-6 pt-8 pb-28 bg-background">
      <div className="max-w-md w-full mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="gap-2 -ml-2 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>

        <div>
          <h1 className="text-3xl font-bold text-foreground">Пополнить баланс</h1>
          <p className="text-muted-foreground mt-2 font-medium">Отправьте USDT на адрес ниже</p>
        </div>

        <Card className="p-6 space-y-5 shadow-card gradient-card rounded-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-muted-foreground">Сеть:</p>
              <p className="text-sm font-bold text-foreground">USDT TRC20</p>
            </div>
          </div>

          <div className="flex justify-center py-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <QRCodeSVG 
                value={DEPOSIT_ADDRESS}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-muted-foreground">Адрес для пополнения:</p>
            <div className="p-4 bg-muted/50 rounded-lg break-all font-mono text-sm font-medium">
              {DEPOSIT_ADDRESS}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={copyAddress}
              className="gap-2 font-bold"
              variant={copied ? "secondary" : "outline"}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Скопировано
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Скопировать
                </>
              )}
            </Button>

            <Button 
              onClick={openInTronLink}
              className="gap-2 font-bold"
              variant="outline"
            >
              <ExternalLink className="w-4 h-4" />
              TronLink
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4 shadow-card gradient-card rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="amount" className="font-bold">Сумма депозита (USDT)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Введите сумму"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="txhash" className="font-bold">TX Hash (необязательно)</Label>
            <Input
              id="txhash"
              type="text"
              placeholder="Хеш транзакции"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              className="font-medium font-mono text-sm"
            />
          </div>

          <Button 
            onClick={handleCreateDeposit}
            className="w-full gap-2 min-h-[52px] rounded-xl gradient-primary text-white font-bold shadow-premium"
            disabled={isLoading || !amount}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Отправка заявки...
              </>
            ) : (
              'Я пополнил'
            )}
          </Button>
        </Card>

        <Card className="p-4 bg-muted/50 border-muted rounded-2xl">
          <p className="text-sm text-muted-foreground">
            <strong>Важно:</strong> После отправки USDT нажмите кнопку "Я пополнил". 
            Администратор проверит транзакцию и зачислит средства на ваш баланс.
          </p>
        </Card>
      </div>
    </div>
  );
}
