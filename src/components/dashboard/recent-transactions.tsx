
"use client";

import type { Transaction } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSettings } from '@/contexts/settings-context';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { currency } = useSettings();
  return (
    <Card className="hover:shadow-xl hover:scale-100">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell><Badge variant="secondary">{transaction.category}</Badge></TableCell>
                  <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.type === 'expense' ? '-' : ''}
                    {Math.abs(transaction.amount).toLocaleString('en-US', { style: 'currency', currency: currency })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-4">No recent transactions.</p>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <Link href="/transactions" passHref>
          <Button variant="ghost" size="sm">
            View All Transactions <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
