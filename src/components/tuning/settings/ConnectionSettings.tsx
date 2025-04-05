
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ConnectionStatus from "../ConnectionStatus";

const ConnectionSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
          <CardDescription>Configure your ECU connection settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="port">COM Port</Label>
              <Select defaultValue="auto">
                <SelectTrigger id="port">
                  <SelectValue placeholder="Select port" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="com1">COM1</SelectItem>
                  <SelectItem value="com2">COM2</SelectItem>
                  <SelectItem value="com3">COM3</SelectItem>
                  <SelectItem value="com4">COM4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="baudRate">Baud Rate</Label>
              <Select defaultValue="115200">
                <SelectTrigger id="baudRate">
                  <SelectValue placeholder="Select baud rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9600">9600</SelectItem>
                  <SelectItem value="19200">19200</SelectItem>
                  <SelectItem value="38400">38400</SelectItem>
                  <SelectItem value="57600">57600</SelectItem>
                  <SelectItem value="115200">115200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="protocol">Protocol</Label>
            <Select defaultValue="k-line">
              <SelectTrigger id="protocol">
                <SelectValue placeholder="Select protocol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="k-line">K-Line (ISO9141-2)</SelectItem>
                <SelectItem value="can">CAN Bus</SelectItem>
                <SelectItem value="j2534">J2534 (PassThru)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Connection Status</Label>
            <ConnectionStatus />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Test Connection</Button>
          <Button>Apply Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConnectionSettings;
